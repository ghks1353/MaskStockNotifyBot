export interface Site {
    url: string;
    type: SiteType;
    available?: boolean;
}

export enum SiteType {
    navershop = "navershop"
}

export const TargetSites: Site[] = [
    //{ url: "https://smartstore.naver.com/zeroskin/products/4708463446", type: SiteType.navershop },
    { url: "https://smartstore.naver.com/sangkong/products/4762917002", type: SiteType.navershop },
    { url: "https://smartstore.naver.com/aer-shop/products/4722827602", type: SiteType.navershop },
    { url: "https://smartstore.naver.com/mfbshop/products/4072435942", type: SiteType.navershop },
    { url: "https://smartstore.naver.com/etiqa/products/4691343733", type: SiteType.navershop },
    { url: "https://smartstore.naver.com/etiqa/products/4691343767", type: SiteType.navershop },
    { url: "https://smartstore.naver.com/etiqa/products/4730528613", type: SiteType.navershop },
    
];
