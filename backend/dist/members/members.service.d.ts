import { Model } from "mongoose";
import { Member, MemberDocument } from "./schemas/member.schema";
import { CreateMemberDto } from "./dto/create-member.dto";
import { AuthService } from "../auth/auth.service";
export declare class MembersService {
    private memberModel;
    private authService;
    constructor(memberModel: Model<MemberDocument>, authService: AuthService);
    create(dto: CreateMemberDto): Promise<Member>;
    findAll(query?: {
        status?: string;
        type?: string;
        search?: string;
    }): Promise<(import("mongoose").Document<unknown, {}, MemberDocument, {}, {}> & Member & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findOne(id: string): Promise<Member>;
    findByEmail(email: string): Promise<Member | null>;
    findOrCreateForUser(user: {
        name: string;
        email: string;
    }): Promise<Member>;
    update(id: string, dto: Partial<CreateMemberDto>): Promise<Member>;
    remove(id: string): Promise<void>;
    incrementBorrowCount(id: string): Promise<void>;
}
