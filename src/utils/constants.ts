export const jwtConstants = {
    secret: "DO NOT USE THIS VALUE. INSTEAD, CREATE A COMPLEX SECRET AND KEEP IT SAFE OUTSIDE OF THE SOURCE CODE.",
};

export enum ROLES {
    USER = "user",
    GUIDE = "guide",
    LEAD_GUIDE = "lead_guide",
    ADMIN = "admin",
}

export enum TourLocation {
    BIG_CITY = "big_city",
    FAMOUS_PLACE = "famous_place",
    BEACH_ISLAND = "beach_island",
    NATIONAL_PARK = "national_park",
    RURAL_AREA = "rural_area",
    HERITAGE_SITE = "heritage_sites",
    MOUNTAINS_FORESTS = "mountain_forest",
}

export enum TourType {
    CULTURAL = "cultural",
    NATURE = "nature",
    ENTERTAINMENT = "entertainment",
    GASTRONOMY = "gastronomy",
    ADVENTURE = "adventure",
    RESORT = "resort",
}

export const USER_HOST = "sandbox.smtp.mailtrap.io";
export const USER_PORT = 25;
export const USER_NAME = "46a7b07ee6d63c";
export const USER_PASSWORD = "6c1d689fe9d5e0";

export interface LoginMetadata {
    ipAddress: string;
    ua: string;
    deviceId: string;
}
