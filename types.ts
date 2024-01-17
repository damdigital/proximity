import { Offer } from "./modules/API/serverTypes";
import { CustomerGroup, TokenValidationTypeStrings } from "./modules/Constants";

export interface DropdownItem {
    label: string,
    value: string | number | null
}

export enum LOGGED_IN_STATE {
    'YES',
    'NO',
    'LOADING',
}

export type NavParamKeys = 'WalletTiles' | 'QRScannerPage' | 'Login' | 'BrandSelection' | 'PartnerSelection'

export type NavParamList = {
    WalletTiles: { brandId: string, centreId: string },
    Dashboard: undefined,
    WalletDetailPage: {
        offerId: string,
        offer?: Offer | null
    },
    QRScannerPage: {
        qrcode?: string | null,
        offer?: Offer | null
    },
    TokenAuthentication: {
        tokenValidationType: TokenValidationTypeStrings,
        targetPage: 'BrandSelection' | 'PartnerSelection'
    },
    TierChangeTokenPage: {
        tier: CustomerGroup
    },
    TierChangeFailedPage: undefined,
    ActivateStaffTier: undefined,
    OneOffOfferTokenPage: {
        centreUrlSegment: string
    }
    RyfOfferTokenPage: {
        centreUrlSegment: string
    }
    StaffRewardTokenPage: {
        centreUrlSegment: string
    }
    StudentPassTokenPage: {
        centreUrlSegment: string
    },
    Login: undefined,
    BrandSelection: {
        token: string,
        invalidTokenError: string
    },
    PartnerSelection: {
        token: string,
        invalidTokenError: string
    },
    BlueLightTierSegment: {
        token: string,
        invalidTokenError: string
    },
    AppUpdatePage: undefined,
    Profile: undefined
};

export interface QueueEntry<T> {
    item: T;
    timestamp: number;
}