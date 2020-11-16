import { stratify } from "d3";

// export class Account {
//     _id: string;
//     userId: string;
//     accessToken: string;
//     itemId: string;
//     institutionId: string;
//     accountName: string;
//     accountType: string;
//     acountSubtype: string;
// }

export class Account {
    _id: string;
    userId: string;
    accessToken: string;
    itemId: string;
    institutionId: string;
    institutionName: string;
    accountName: string;
    accountType: string;
    accountSubtype: string;
    current: boolean;
    subAccounts: object;
}