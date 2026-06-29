import { Document } from "mongoose";
export type MemberDocument = Member & Document;
export declare enum MembershipType {
    STANDARD = "standard",
    PREMIUM = "premium",
    STUDENT = "student",
    SENIOR = "senior"
}
export declare enum MemberStatus {
    ACTIVE = "active",
    SUSPENDED = "suspended",
    EXPIRED = "expired"
}
export declare class Member {
    name: string;
    email: string;
    phone?: string;
    membershipType: MembershipType;
    expiryDate: Date;
    status: MemberStatus;
    borrowedCount: number;
}
export declare const MemberSchema: import("mongoose").Schema<Member, import("mongoose").Model<Member, any, any, any, Document<unknown, any, Member, any, {}> & Member & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Member, Document<unknown, {}, import("mongoose").FlatRecord<Member>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Member> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
