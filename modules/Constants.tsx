export const AsyncStorageKeys = {
    preferredLanguage: "preferedLanguageCode",
    localization: "{0}_localization",
    walletChangesQueue: "walletChangesQueue",
    walletOffersList: "walletOffersList",
    brands: "brands",
    tapOrScanPrefetchedTagIds: "tapOrScanPrefetchedTagIds",
    locale: "locale",
    myOffersOnboardingPage: "MyOffersOnboardingPage",
    proximityData: "proximityData",
    proximityDataInitialExits: "proximityDataInitialExits",
    proximityLastNotifications: "proximityLastNotifications",
    syncPostfix: "_synced",
    imageCacheMapping: "imageCacheMapping",
    posScanTime: "posScanTime",
    invalidScan: "invalidScan",
    postRegistrationPage: "PostRegistrationPage",
    WelcomeDone:"WelcomeDone"
}

export const Tasks = {
    GEOFENCING_BACKGROUND_TASK: 'GEOFENCING_BG_TASK',
    BACKGROUND_FETCH_TASK: 'BG_FETCH_TASK',
    SYNC_OFFLINE_SCAN_BG_TASK: 'SYNC_OFFLINE_SCAN_BG_TASK'
}

export const Segments = {
    BLUE_LIGHT: 'Blue Light'
}

export const QueryParams = {
    QRCODE: 'qrcode',
    LINKING: 'linking'
}

export enum TokenValidationType {
    RecycleYourFashion = 0,
    SetUserTier = 1,
    StudentPass = 2,
    OneOffOffer = 3,
    BrandStaffTierChange = 4,
    BrandPartnerTierChange = 5,
    StaffTierChange = 6,
    BlueLight = 7,
    StaffReward = 8
}

export type TokenValidationTypeStrings = keyof typeof TokenValidationType;

export type TierChangeTokenValidationTypeString =
    | typeof TokenValidationType.SetUserTier
    | typeof TokenValidationType.BrandStaffTierChange
    | typeof TokenValidationType.BrandPartnerTierChange
    | typeof TokenValidationType.StaffTierChange
    | typeof TokenValidationType.BlueLight
    | typeof TokenValidationType.StaffReward

export type TierChangeTokenValidationType = Extract<TokenValidationType, TierChangeTokenValidationTypeString>

export enum CustomerGroup {
    BASE_MEMBER = "BASE_MEMBER",
    UK_BLUE_LIGHT = "UK_BLUE_LIGHT",
    STAFF_BRAND = "STAFF_BRAND",
    PARTNER = "PARTNER",
    STAFF_MG = "STAFF_MG",
    STUDENT = "STUDENT",
    LOUNGE = "LOUNGE",
    EXCLUDE = "EXCLUDE",
}