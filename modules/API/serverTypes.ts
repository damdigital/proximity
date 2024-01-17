import { CustomerGroup } from "../Constants";

export interface ServerStatusResponse {
    success?: boolean | null,
    errorCode?: number | null,
    errorMessage?: string | null
}

export interface CMSContentLink<T> {
    expanded: T
}

export interface NavGridCard {
    hideInWebApp: boolean,
    hideInNativeApp: boolean,
    imageReference: ContentLink,
    editoralContentBlockHeading: string | null,
    editoralUrl: string | null,
    isReferAFriendTrigger: boolean | null,
    chosenOfferTierBlocks: string | null
}

export interface CmsBlock<T> {
    contentLink: CMSContentLink<T>
}

export interface PrizeDrawBlock {
    contentLink: ContentLink;
    name: string;
    language: CMSLanguage;
    existingLanguages?: (CMSLanguage)[] | null;
    masterLanguage: CMSLanguage;
    contentType?: (string)[] | null;
    parentLink: ContentLink;
    routeSegment?: any | null;
    url?: any | null;
    changed: string;
    created: string;
    startPublish: string;
    stopPublish?: any | null;
    saved: string;
    status: string;
    category?: (any)[] | null;
    prizeDrawGreetingAboveName: string | null;
    prizeDrawYouCanStillEnter: string | null;
    image: ContentLink;
    imageSmall: ContentLink;
    prizeDrawShopAndScan: string | null;
    prizeDrawEachScan: string | null;
    prizeDrawTnCText: string | null;
    prizeDrawButtonText: string | null;
    prizeDrawDoNotShowText: string | null;
    prizeDrawOneMore: string | null;
    prizeDrawAlreadyScanForThisBrand: string | null;
    enabledPrizeDraw: boolean;
    prizeDrawBannerTitle: string | null;
    prizeDrawName: string | null;
    prizeDrawBannerText: string | null;
    prizeDrawLabel: string | null;
    prizeDrawCancelButtonText: string | null;
    prizeDrawTnCAlertText: string | null;
    prizeDrawCancelAlertText: string | null;
    prizeDrawStartDate: string | null;
    prizeDrawEndDate: string | null;
    anchorName: string | null;
}
export interface ContentLink {
    id: number;
    workId: number;
    guidValue: string;
    providerName?: any | null;
    url?: string | null;
    expanded?: any | null;
}
export interface CMSLanguage {
    link?: null;
    displayName: string;
    name: string;
}

export interface CMSPrizeDraw {
    prizeDrawBlock: PrizeDrawBlock,
    tnCsAccepted: boolean,
    doNotShow: boolean,
    alreadyShownToday: boolean,
    secondVisitDuringTimeline: boolean,
    isPrizeDrawCurrentlyRunning: boolean,
    userAlreadyScannedTodayForThisBrand: boolean,
    declinedCount: number
    // PrizeDrawDto: any
}

export interface IOfflinePrizeDrawUpload {
    prizeDrawPreferences: IPrizeDrawPreference[]
}

export interface IPrizeDrawPreference {
    brandId: number,
    acceptedConfirmation: boolean,
    dontShowAgain: boolean
}

export interface IPrizeDrawPreferenceData extends IPrizeDrawPreference {
    dateOfConfirmation: string
}

export interface IOfflinePrizeDrawUploadResult {
    status: string,
    prizeDrawConfrimationResults: SynchronizationResult[]
}

export interface SynchronizationResult {
    success: boolean,
    statusCode: number,
    statusMessage: string | null,
    guid: string,
}

export interface IPrizeDrawUploadResult {
    status: string,
    errorCode?: number | undefined,
    added?: boolean | undefined
}

export interface QRScan {
    brandId: string | number,
    centreId: string | number,
    isCheckIn?: boolean | undefined
}

export interface TotemQRScan {
    centreId: string | number,
    location?: string | null | undefined
}

export interface Benefit {
    contentLink: ContentLink
}

export interface CMSDashboardPage {
    navGridCardContentArea: CmsBlock<NavGridCard>[],
    headerImage: ContentLink,
    tierInformationHeadingXhtmlString: string | null,
    tierMembershipDescription: string | null,
    shoppingHistoryLinkText: string | null,
    showBenefitsListLinkText: string | null,
    membershipBenefitList: Benefit[] | null
}

export interface CheckInSplash {
    SplashRedemptionTimeout: number,
    RedemptionGracePeriod: number,
    CheckInSplashTitle: string | null,
    PrizeDraw: CMSPrizeDraw
}

export interface DashboardPageData {
    userLastActivation: any,
    lastScannedBrand: Brand,
    checkInSplash: CheckInSplash,
    magClubDashboardPage: CMSDashboardPage,
    checkins: Checkin[]
}

export interface Checkin {
    checkinDate: string | null,
    brandId: number,
    brandImage: string | null,
    brandUrl: string | null,
    centreId: number
}

export interface CMSReferAFriend {
    referFriendLinkUrl: string | null,
    referFriendHeroImageUrl: string | null,
    referFriendTermsText: string | null,
    referFriendTermsUrl: string | null,
    referAFriendShareSubject: string | null,
    referAFriendShareMessage: string | null
}

export interface TapOrScanTag {
    id: number,
    outletId: number,
    outlet: string,
    location: string,
    tagId: string,
    targetUrl: string
}

export interface TapOrScanTagResponse {
    ok: number,
    data: TapOrScanTag[]
}

export interface Offer {
    centreId: number;
    offerId: string | null;
    offerName: string;
    offerTitle: string;
    offerDescription: string;
    offerPercentage: string;
    offerMaximumNumberOfRedeem: number;
    offerRedemptionTimer: number;
    type: string;
    offerType: string;
    participatingBrands: ParticipatingBrand[];
    passState: string;
    passCentreId?: number | null;
    passLastRedemption?: Date | null;
    passRedeemCount?: number | null;
    passActivationCentre?: string | null;
    passToken?: string | null;
    offerStyle: string;
    bannerImage: string;
    offerStartsAt: string;
    offerStartDateAfterCurrentDateTime: boolean;
    offerExpirationDateTime: Date | null;
    centreWideImage?: string | null;
    useCentreWideImage: boolean;
    offeringBrandId?: number | null;
    termsAndConditionsExcerpt: string | null;
    termsAndConditionsBody: string | null;
    termsAndConditionPageUrl: string;
    offerImage: string;
    categories?: (number)[] | null;
    showRedemptionCounter: boolean;
    offerVisibleFromDate?: string | null;
    passValidUntil?: string | null;
    disableTitle: boolean;
    offerImageAlt?: string | null;
    offerValidFor: number;
    offerMultipleActivation: boolean;
    offerExclusionsText?: string | null;
    showExpirationDateOnPass: boolean;
    showOfferTitleOnWalletPassPage: boolean;
    useOfferBlockExpiryDate: boolean;
    offerExpirationDateTimeWithTierStartDate: string;
    barcodeImageUrl: string;
    barcodePassBrandName: string;
    offerBlockType?: string | undefined;
    isNonClubOffer: boolean;
    isAutoRedemptionEnabled: boolean;
    overrideEventOffer: boolean;
    swipeInstructionalText: string | null;
    scanInstructionalText: string | null
}

export interface ParticipatingBrand {
    id: number;
    name: string;
    discountPercent: number;
    exclusionText: string;
    footnoteNumber: number | undefined
}

export interface Brand {
    id: number;
    name: string;
    image: string;
    url: string;
}

export interface Profile {
    name: string;
    firstName: string;
}

export interface TagId {
    id: number;
    outletId: number;
    outlet: string;
    location: string;
    tagId: string;
    targetUrl: string;
}

export interface Category {
    id: number,
    name: string,
    parent: number
    selected?: boolean | null;
}

export interface UnifiedOfflineData {
    centreTime: string,
    offers: Offer[],
    brands: Store[],
    profile: UserProfile,
    tagIds: TagId[],
    redemptionGracePeriod: number,
    categories: Category[],
    customerGroups: { [key: string]: string },
    prizeDraw?: CMSPrizeDraw | null,
    staffRetailerName?: string | null,
    displayDiscountInNegative: boolean,
    nonClubOffersCount: number
}

export interface IUpdateOfflineCacheParams {
    centreId?: string | number | undefined,
    timeout?: number | null | undefined,
    brandId?: string | number | undefined,
}

export interface IUpdatePrizeDrawCacheParams {
    centreId?: string | number | undefined,
    timeout?: number | null | undefined,
}

export interface UserProfile {
    id: string;
    url: string;
    firstName: string;
    lastName: string;
    name: string;
    gender: string | null;
    email: string;
    language: string;
    hasOptedInToPush: string;
    languageCode: string;
    country: string;
    city: string | null;
    postCode: string;
    phoneNumber: string | null;
    contactId: string;
    dateOfBirth: Date | null;
    createdOn: Date | null;
    lastPasswordChange: Date | null;
    referrersCenterIds: number[];
    refereeCenterIds: number[];
    subscription: Subscription;
}

export interface Subscription {
    id: string;
    createdOn: Date | null;
    type: string;
    isBlueLightMember: boolean;
    isBlueLightMembership: boolean;
    blueLightStartDate: Date | null;
    membershipTier: CustomerGroup;
    membershipTierDisplayName: string;
    clubStartDate: Date;
    clubExpiryDate: Date | null;
    rewardPreferences: string;
    rewardPreferencesLastSelection: Date | null;
    preferredCenter: Center;
    brandStaffBrand: SubscriptionBrand | null;
    partner: Partner | null;
}

export interface Center {
    id: number;
    name: string;
    displayName: string;
    isRafTurnedOn: boolean;
}

export interface SubscriptionBrand {
    id: number;
    name: string;
}

export interface Partner {
    id: string;
    name: string;
}

export interface SFAttributes {
    type: string;
    url: string;
}

export interface CentreLanguages {
    [key: string]: string
}

export interface LanguagesPerCentre {
    [key: number]: CentreLanguages
}

export interface DropdownItem {
    label: string,
    value: string,
    id: string
}

export interface CMSProfilePage {
    brandPage: any,
    partnerSelection: any,
    dataExplanationMsg: string,
    blueTierSegmentName: string,
    centres: Array<DropdownItem>,
    languages: LanguagesPerCentre
}

export interface OpeningTime {
    dayOfWeek: number,
    openingTimeType: number,
    from: string,
    to: string,
    andFrom: any,
    andTo: any,
    specialhours: boolean,
    openingTimeInformationText: string,
    overrideTimeText: string
}

export interface Store {
    id: number,
    image: string | null,
    url: string | null,
    openingTimesForToday: string | null,
    name: string | null,
    openingTimes: OpeningTime[],
    logo: string | null,
    bannerImage: string | null,
    exclusionText: string | null,
    centreId: number
    isExpired: boolean | null
}

export interface StoreResponse {
    stores: Store[]
}

export type RedemptionOrActivationObject = {
    brandLocationId?: string | number | undefined,
    centreLocationId: string | number,
    offerId?: string | null | undefined,
    passToken?: string | null | undefined,
    location?: string | null | undefined,
    prizeDrawConfirmation?: boolean | null | undefined
}

interface WalletChangeArguments extends RedemptionOrActivationObject {
    createdAt: Date,
    guid: string,
}

export interface WalletChange {
    name: string,
    at: Date,
    args: WalletChangeArguments
}

export interface RedemptionUploadRequest {
    source: string,
    checkins: WalletChangeArguments[],
    redemptionOrActivations: WalletChangeArguments[]
}

export class TimeoutError extends Error {
    constructor(message?: string) {
        super(message)
        this.name = 'TimeoutError'
    }
}

export interface Centre {
    outletPreTitle: string;
    outletTitle: string;
    openingTimesForToday: string;
    centreId: number;
    centreUrlSegment: string;
}

export interface SfBrand {
    id: number;
    name: string;
}

export interface FavouriteBrand {
    id: number;
    sfBrandPreferenceId: string;
}

export interface CentreBrand {
    brandName: string;
    brandId: number;
    bwLogoUrl: string | null;
    bwLogoAlt: string | null;
    salesforceBrandId: number;
}

export interface GroupedCentreBrands {
    title: string;
    brands: CentreBrand[];
}
export interface IPartnerSelectionOutcome {
    ok?: boolean | undefined,
    error?: string | undefined
}

export interface ITierChangeOutcome {
    ok?: boolean | undefined,
    errorMessage?: string | undefined,
    errorCode?: number | undefined
}

export interface ISetTierModel {
    Token: number,
    Tier: string,
    BlueLightSegment?: string | undefined
}

export interface ProfileModel {
    firstName: string,
    lastName: string,
    phoneNumber: string,
    city: string,
    postCode: string,
    country: string,
    gender: string,
    dateOfBirth: string | Date,
    language: string,
    hasOptedInToPush: string
}

export interface CenterList {
    centreOptions: CenterOption[];
}

export interface CenterOption {
    disabled: boolean,
    group: null,
    selected: boolean,
    text: string,
    value: string
}

export interface IMappedinData {
    clientId: string,
    clientSecret: string,
    venue: string,
    url: string
}

export interface RegionMessageResponse {
    messages: RegionMessages;
}

export interface RegionMessages {
    [key: string]: RegionMessage;
}

export interface RegionMessage {
    welcomeMessage: string;
    goodbyeMessage: string;
}

export interface ProximityData {
    country: string;
    siteSetttings: SiteSetttings;
    regions?: (RegionsEntity)[] | null;
}
export interface SiteSetttings {
    proximityMessageFetchTimeout: number;
}
export interface RegionsEntity {
    identifier: string;
    name: string;
    latitude: number;
    longitude: number;
    radius: number;
    destinationLinkEnter?: string | null;
    destinationLinkExit?: string | null;
    notifyOnEnter: boolean;
    notifyOnExit: boolean;
    messages: RegionMessages;
    intime: number;
    outtime: number;
    notificationOpeningTimes?: (NotificationOpeningTimesEntity)[] | null;
    guid: string;
}
export interface NotificationOpeningTimesEntity {
    dayOfWeek: number;
    from: string;
    to: string;
}

export type ServerResponseData<T> = T | Response | null | undefined

export type ServerResponse<T> = {
    success: boolean,
    status: number | null,
    data: ServerResponseData<T>,
    error: Error | null | undefined
}
