import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { GeofencingEventType, LocationAccuracy } from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { fetchProximityData, fetchRegionMessage } from './modules/API';
import { AsyncStorageKeys, Tasks } from "./modules/Constants"
import * as Notifications from "expo-notifications";
import * as BackgroundFetch from 'expo-background-fetch';
import { Platform } from 'react-native';
import { createLogger } from './modules/Log';
import { deepEqual, formatString, haveSameDatePart, mkGUID, parseTime } from './modules/Utils';
import { ProximityData, RegionMessage, RegionMessageResponse, RegionsEntity, ServerResponse } from './modules/API/serverTypes';
import { QueueEntry } from './types';
import { QueueProcessorInterface } from './QueueProcessor';
import { ThresholdBasedQueueProcessor } from './ThresholdBasedQueueProcessor';

const logger = createLogger('Proximity');
const console = logger

const getRegionMessage = async (region: RegionsEntity) => {
    const proximityData = await getProximityData()
    const preferredLanguage = await AsyncStorage.getItem(AsyncStorageKeys.preferredLanguage) || "en"
    const regionMessageObj = await fetchRegionMessage(region?.identifier,
        proximityData?.siteSetttings?.proximityMessageFetchTimeout || 3000).catch((e) => console.error(e, 'Unable to fetch region message'))
    let regionMessage: RegionMessage
    const regionMessageServerResponse = regionMessageObj as ServerResponse<RegionMessageResponse>
    if (regionMessageServerResponse?.status === 200) {
        const regionMessageResponse = regionMessageServerResponse.data as RegionMessageResponse
        regionMessage = regionMessageResponse?.messages?.[preferredLanguage] || regionMessageResponse?.messages?.["en"]
        console.log(`Region message fetched successfully: '${JSON.stringify(regionMessage)}'`)
    } else {
        console.log(`Unable to fetch region message from server ${JSON.stringify(regionMessageServerResponse)}`)
    }
    if (!regionMessage) {
        regionMessage = region?.messages?.[preferredLanguage] || region?.messages?.["en"]
        console.log(`Falling back to previously fetched region message: '${JSON.stringify(regionMessage)}'`)
    }
    return regionMessage
}

const getProximityData = async (): Promise<ProximityData> => {
    let ret: ProximityData = null
    try {
        const proximityDataStr = await AsyncStorage.getItem(AsyncStorageKeys.proximityData)
        ret = JSON.parse(proximityDataStr)

    } catch (e) {
        console.error(e, 'Unable to get proximity data')
        console.error(e, 'Unable to get proximity data')
    }
    return ret
}

const setProximityData = async (proximityData: ProximityData) => {
    return await AsyncStorage.setItem(AsyncStorageKeys.proximityData, JSON.stringify(proximityData))
}

const getRegionStatuses = async (): Promise<RegionStatuses> => {
    let ret: RegionStatuses = {}
    try {
        const dataStr = await AsyncStorage.getItem(AsyncStorageKeys.proximityDataInitialExits)
        ret = JSON.parse(dataStr) || {}
    } catch (e) {
        console.error(e, 'Unable to get region statuses')
    }
    return ret
}

const setRegionStatuses = async (data: RegionStatuses) => {
    return await AsyncStorage.setItem(AsyncStorageKeys.proximityDataInitialExits, JSON.stringify(data))
}

const getRegionStatus = async (identifier: string) => {
    const regionStatuses = await getRegionStatuses()
    return regionStatuses[identifier] || { initialExitCalled: false, lastEnter: 0, lastExit: 0 }
}

const setRegionStatus = async (identifier: string, data: RegionStatus) => {
    const regionStatuses = await getRegionStatuses()
    regionStatuses[identifier] = data
    await setRegionStatuses(regionStatuses)
}


const getAsLocationRegion = (regionsEntity: RegionsEntity): Location.LocationRegion => {
    return {
        identifier: regionsEntity.identifier,
        latitude: regionsEntity.latitude,
        longitude: regionsEntity.longitude,
        notifyOnEnter: regionsEntity.notifyOnEnter,
        notifyOnExit: regionsEntity.notifyOnExit,
        radius: regionsEntity.radius,
    }
}

const setProximityDataAndStartGeofencingIfChanged = async (proximityData: ProximityData) => {
    const currentProximityData = getProximityData()
    if (deepEqual(currentProximityData, proximityData)) {
        // no change
        console.debug(`Proximity data unchanged, skip setProximityDataAndStartGeofencingIfChanged`)
    } else {
        const regions = proximityData?.regions || []
        // set initial exits to false
        // when starting geofencing, each region will be called with an exit event and we want to skip them
        const regionStatuses = await getRegionStatuses()
        regions.forEach(r => {
            let regionStatus: RegionStatus
            if (r.identifier in regionStatuses) {
                regionStatus = regionStatuses[r.identifier]
            } else {
                regionStatus = {} as RegionStatus
                regionStatuses[r.identifier] = regionStatus
            }
            regionStatus.initialExitCalled = false
        })
        console.debug(`Set initial region statuses...`)
        await setRegionStatuses(regionStatuses)
        console.debug(`Initial region statuses set`)
        initialExitsHasBeenSet = true
        const regionsForGeoFencing: Location.LocationRegion[] = regions.map(r => getAsLocationRegion(r))
        await setProximityData(proximityData)
        await startGeofencingOrUpdateRegions(regionsForGeoFencing)
    }
}

const getRegion = async (identifier: string): Promise<RegionsEntity> => {
    const proximityData = await getProximityData()
    const regions = proximityData?.regions || []
    const region = regions.find(r => r.identifier === identifier)
    if (!region) {
        console.debug(`No such region ${identifier}`)
    }
    return region
}

interface RegionStatuses {
    [key: string]: RegionStatus
}

interface RegionStatus {
    lastEnter: number;
    lastExit: number;
    initialExitCalled: boolean;
}

const parsePermissionStatus = (notificationPermissionsStatus: Notifications.NotificationPermissionsStatus): boolean => {
    let granted: boolean = null
    if (notificationPermissionsStatus != null) {
        granted = false
        switch (Platform.OS) {
            case 'android':
                granted = notificationPermissionsStatus?.status === Location.PermissionStatus.GRANTED
                break;
            case 'ios':
                granted = [
                    Notifications.IosAuthorizationStatus.AUTHORIZED,
                    Notifications.IosAuthorizationStatus.PROVISIONAL,
                    Notifications.IosAuthorizationStatus.EPHEMERAL
                ].includes(notificationPermissionsStatus?.ios?.status)
        }
        if (!granted) {
            console.log(`Permission to notification is ${JSON.stringify(notificationPermissionsStatus)}`);
        } else {
            console.log(`Permission to Notification has been granted`)
        }
    }
    return granted
}

export const getNotificationPermissionsAsync = async (): Promise<boolean> => {
    let granted: boolean = null
    try {
        const res = await Notifications.getPermissionsAsync()
        granted = parsePermissionStatus(res)
    } catch (error) {
        console.error(error, `Error occured ${error?.message}`)
    }
    return granted
}

export const requestNotificationPermissionsAsync = async (): Promise<boolean> => {
    let granted: boolean = null
    try {
        const res = await Notifications.requestPermissionsAsync({
            ios: {
                allowAlert: true,
                allowBadge: true,
                allowSound: true,
                allowAnnouncements: true,
            },
        });
        granted = parsePermissionStatus(res)
    } catch (error) {
        console.error(error, `Error occured ${error?.message}`)
    }
    return granted
}

export const getLocationPermissionsAsync = async (): Promise<Location.PermissionStatus> => {
    let ret: Location.PermissionStatus
    try {
        let { status } = await Location.getForegroundPermissionsAsync();
        ret = status
        if (status !== Location.PermissionStatus.GRANTED) {
            console.log(`Permission to access location is ${status}`);
        } else {
            // your app can't obtain background permission without foreground permission
            let { status } = await Location.getBackgroundPermissionsAsync();
            ret = status
            if (status !== Location.PermissionStatus.GRANTED) {
                console.log(`Permission to background access location is ${status}`);
            } else {
            }
        }
    } catch (error) {
        console.error(error, `Error occured ${error?.message}`)
    }
    return ret
}

export const requestLocationPermissionsAsync = async (): Promise<Location.PermissionStatus> => {
    let ret: Location.PermissionStatus
    try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        ret = status
        if (status !== Location.PermissionStatus.GRANTED) {
            console.log(`Permission to access location was ${status}`);
        } else {
            // your app can't obtain background permission without foreground permission
            let { status } = await Location.requestBackgroundPermissionsAsync();
            ret = status
            if (status !== Location.PermissionStatus.GRANTED) {
                console.log(`Permission to background access location was ${status}`);
            } else {
            }
        }
    } catch (error) {
        console.error(error, `Error occured ${error?.message}`)
    }
    return ret
}

export const registerBackgroundFetchOnce = async () => {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(Tasks.BACKGROUND_FETCH_TASK)
    if (!isRegistered) {
        console.log(`Registering background task`)
        await BackgroundFetch.registerTaskAsync(Tasks.BACKGROUND_FETCH_TASK, {
            minimumInterval: 24 * 60 * 60, // 24 hours
        });
    } else {
        console.log(`Background task is already registered`)
    }
}

const hasNotificationDefined = region => region?.notifyOnEnter || region?.notifyOnExit

const startGeofencingOrUpdateRegions = async (regions: Location.LocationRegion[]) => {

    const regionsFiltered = regions?.filter(hasNotificationDefined)
    if (regionsFiltered?.length && regionsFiltered?.length > 0) {
        console.log(`Start geofencing ${new Date().toJSON()}`)
        // If you want to add or remove regions from already running geofencing task, you can just call startGeofencingAsync again with the new array of regions.
        await Location.startGeofencingAsync(Tasks.GEOFENCING_BACKGROUND_TASK, regionsFiltered).catch(e => console.error(e, 'Unable to start geofencing'))
    } else {
        const started = await Location.hasStartedGeofencingAsync(Tasks.GEOFENCING_BACKGROUND_TASK)
        if (started) {
            console.log(`Stop geofencing ${new Date().toJSON()}`)
            await Location.stopGeofencingAsync(Tasks.GEOFENCING_BACKGROUND_TASK).catch(e => console.error(e, 'Unable to stop geofencing'))
        }
    }

    // We need to watch for location changes throughout the duration of the app session
    const watch = await Location.watchPositionAsync({
        accuracy: LocationAccuracy.Highest,
    }, (locationObject) => { }) // TODO: do something with the watched location object maybe?
}

export const updateProximityData = async () => {
    console.log(`Updating proximity data ${new Date().toJSON()}`)
    const fetchedProximityData = await fetchProximityData().catch(e => console.error(e, 'Error updating proximity data'))
    const fetchedProximityDataServerResponse = fetchedProximityData as ServerResponse<ProximityData>
    if (fetchedProximityDataServerResponse?.status === 200) {
        await setProximityDataAndStartGeofencingIfChanged(fetchedProximityDataServerResponse?.data as ProximityData)
    }
}

export const stopGeofencing = async () => {
    await startGeofencingOrUpdateRegions([])
}

interface ValidationOutcome {
    validInitialExit?: boolean
    validLastNotification?: boolean
    validateNotificationOpeningTime?: boolean,
    validRegion?: boolean,
    region: RegionsEntity
}

const validateRegionStatus = async (region: RegionsEntity, eventType: Location.LocationGeofencingEventType): Promise<ValidationOutcome> => {
    let validInitialExit = true
    const regionStatuses = await getRegionStatuses()
    const regionStatus = regionStatuses[region?.identifier] || {} as RegionStatus
    console.debug(`Validate region status ${JSON.stringify({ regionStatuses }, null, 2)}`)
    const initialExitCalled = regionStatus.initialExitCalled || false
    if (!initialExitCalled && eventType === GeofencingEventType.Exit) {
        console.debug(`First exit, skip ${region.guid}`) // when starting geofencing, each region will be called with an exit event
        validInitialExit = false
    }
    let timestamp: number
    switch (eventType) {
        case Location.LocationGeofencingEventType.Enter:
            timestamp = regionStatus.lastEnter || 0
            break;
        case Location.LocationGeofencingEventType.Exit:
            timestamp = regionStatus.lastExit || 0
            break;
    }
    let validLastNotification = !haveSameDatePart(new Date(), new Date(timestamp))
    console.debug({ region: region?.guid, validLastNotification, validInitialExit })
    return { region, validInitialExit, validLastNotification }
}

const validateNotificationOpeningTime = (region: RegionsEntity, eventType: Location.GeofencingEventType) => {
    let valid = true
    const now = new Date()
    const notificationOpeningTime = region?.notificationOpeningTimes?.find(notificationOpeningTime => notificationOpeningTime.dayOfWeek === now.getDay())
    if (notificationOpeningTime) {
        console.debug(`Found opening time ${JSON.stringify({ region: region?.guid, notificationOpeningTime }, null, 2)}`)
        const from = parseTime(notificationOpeningTime.from)
        const to = parseTime(notificationOpeningTime.to)
        const midNight = new Date().setHours(23, 59, 1);
        switch (eventType) {
            case Location.LocationGeofencingEventType.Enter:
                valid = now.getTime() >= from.getTime() && now.getTime() <= to.getTime()
                break;
            case Location.LocationGeofencingEventType.Exit:
                valid = now.getTime() >= to.getTime() && now.getTime() <= midNight
                break;
        }

    }
    return valid
}

const validateRegion = async (region: RegionsEntity, eventType: Location.LocationGeofencingEventType): Promise<ValidationOutcome> => {
    const validationOutcome = await validateRegionStatus(region, eventType)
    validationOutcome.validateNotificationOpeningTime = validateNotificationOpeningTime(region, eventType)
    validationOutcome.validRegion = !!region
    console.debug(`Validate region ${JSON.stringify({ region: region.guid, validationOutcome: { ...validationOutcome, region: undefined } }, null, 2)}`)
    return validationOutcome
}

console.log(`Defining ${Tasks.BACKGROUND_FETCH_TASK}`)
TaskManager.defineTask(Tasks.BACKGROUND_FETCH_TASK, async () => {
    console.log(`Fetching data in background ${new Date().toJSON()}`)
    const granted = await getNotificationPermissionsAsync()
    const status = await getLocationPermissionsAsync()
    if (granted && status === Location.PermissionStatus.GRANTED) {
        await updateProximityData()
    }
    return BackgroundFetch.BackgroundFetchResult.NewData;
});

console.log(`Creating region state`)
console.log(`Defining ${Tasks.GEOFENCING_BACKGROUND_TASK}`)
interface GeofencingEvent {
    eventType: GeofencingEventType,
    region: Location.LocationRegion
}
TaskManager.defineTask(Tasks.GEOFENCING_BACKGROUND_TASK, ({ data: { eventType, region }, error }: TaskManager.TaskManagerTaskBody<GeofencingEvent>) => {
    console.log(`Event received`, { eventType: parseEventType(eventType), region })
    if (error) {
        console.error(error, 'Task: error received')
        return;
    }
    getQueueProcessor().push({ eventType, region });
});

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

const parseEventType = (eventType: GeofencingEventType): string => eventType === GeofencingEventType.Enter ? "Enter" : "Exit"

const processEvent = async ({ eventType, region }: GeofencingEvent) => {
    await resetInitialExitsIfItHasNotBeenSet()
    const parsedEventType = parseEventType(eventType)
    const _region = await getRegion(region?.identifier)
    _region.guid = mkGUID()
    console.debug(`Processing '${parsedEventType}' event ${_region.name}(${region.identifier}) ${_region.guid}`) // ${JSON.stringify({ region: _region, eventType: parsedEventType }, null, 2)}`, { region: _region, eventType: parsedEventType })
    const validationOutcome = await validateRegion(_region, eventType)
    const regionStatus = await getRegionStatus(_region.identifier);
    if (!isValid(validationOutcome)) {
        if (validationOutcome.validRegion && !validationOutcome.validInitialExit && eventType === GeofencingEventType.Exit) {
            setRegionStatus(_region.identifier, { ...regionStatus, initialExitCalled: true })
        }
        // return
    }
    try {
        const regionMessage = await getRegionMessage(_region)
        if (regionMessage) {
            console.log(`Scheduling notification async ${JSON.stringify({
                eventType: parsedEventType,
                _region: _region.guid,
                regionMessage,
                valid: { ...validationOutcome, region: undefined }
            }, null, 2)}`);
            let title: string, url: string
            if (eventType === GeofencingEventType.Enter) {
                title = formatString(regionMessage?.welcomeMessage, _region?.name)
                url = _region.destinationLinkEnter || ``
            } else if (eventType === GeofencingEventType.Exit) {
                title = formatString(regionMessage?.goodbyeMessage, _region?.name)
                url = _region.destinationLinkExit || ``
            }

            Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body: JSON.stringify({
                        event: `${validationOutcome.region.name} ${eventType === GeofencingEventType.Enter ? 'Enter' : 'Exit'}`,
                        ...{ ...validationOutcome, region: undefined },
                        lastExit: regionStatus.lastExit,
                        lastEnter: regionStatus.lastEnter,
                        initialExitCalled: regionStatus.initialExitCalled
                    }, null, 2),
                    data: {
                        url
                    }
                },
                trigger: null,
            });
            if (isValid(validationOutcome)) {
                switch (eventType) {
                    case GeofencingEventType.Exit:
                        regionStatus.initialExitCalled = true;
                        regionStatus.lastExit = Date.now()
                        break
                    case GeofencingEventType.Enter:
                        regionStatus.lastEnter = Date.now()
                        break
                }
                setRegionStatus(_region.identifier, regionStatus)
            }
        } else {
            console.log('Fetch failed')
        }
    } catch (error) {
        console.error(error, 'Error scheduling notification')
    }
}

const preprocessQueue = async (queue: QueueEntry<GeofencingEvent>[]) => {
    const threshold = 60000; // 60 seconds, for example
    const seen = new Map<string, number>();

    let i = 0;
    while (i < queue.length) {
        const entry = queue[i];
        const key = `${entry.item.eventType}-${entry.item.region.identifier || ''}`;
        const lastTimestamp = seen.get(key);

        if (lastTimestamp === undefined || entry.timestamp - lastTimestamp > threshold) {
            seen.set(key, entry.timestamp);
            i++; // Move to next item
        } else {
            queue.splice(i, 1); // Remove the item and keep `i` pointing to the next item
        }
    }
}

const generateIdentifier = ({ eventType, region }: GeofencingEvent): string => `${eventType}-${region.identifier || ''}`

const isValid = (outcome: ValidationOutcome): boolean => {
    return outcome.validRegion && outcome.validInitialExit && outcome.validLastNotification && outcome.validateNotificationOpeningTime
}

const getQueueProcessor = (): QueueProcessorInterface<GeofencingEvent> => {
    if (!processor) {
        processor = new ThresholdBasedQueueProcessor<GeofencingEvent>(processEvent, generateIdentifier, 30000)
    }
    return processor
}

let processor: QueueProcessorInterface<GeofencingEvent>

let initialExitsHasBeenSet = false

const resetInitialExitsIfItHasNotBeenSet = async () => {
    if (!initialExitsHasBeenSet) {
        await resetInitialExits()
    }
}

const resetInitialExits = async () => {
    const regionStatuses = await getRegionStatuses()
    for (let identifier in regionStatuses) {
        regionStatuses[identifier].initialExitCalled = false
    }
    setRegionStatuses(regionStatuses)
    initialExitsHasBeenSet = true
}
