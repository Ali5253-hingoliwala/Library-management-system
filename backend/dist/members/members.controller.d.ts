import { MembersService } from "./members.service";
import { CreateMemberDto } from "./dto/create-member.dto";
export declare class MembersController {
    private membersService;
    constructor(membersService: MembersService);
    findAll(status?: string, type?: string, search?: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/member.schema").MemberDocument, {}, {}> & import("./schemas/member.schema").Member & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findOne(id: string): Promise<import("./schemas/member.schema").Member>;
    create(dto: CreateMemberDto): Promise<import("./schemas/member.schema").Member>;
    update(id: string, dto: Partial<CreateMemberDto>): Promise<import("./schemas/member.schema").Member>;
    remove(id: string): Promise<void>;
}
