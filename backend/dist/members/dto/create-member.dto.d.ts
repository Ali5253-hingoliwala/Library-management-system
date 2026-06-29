import { MembershipType, MemberStatus } from "../schemas/member.schema";
export declare class CreateMemberDto {
    name: string;
    email: string;
    password?: string;
    phone?: string;
    membershipType?: MembershipType;
    expiryDate: string;
    status?: MemberStatus;
}
