import { JwtService } from "@nestjs/jwt";
import { Model } from "mongoose";
import { User, UserDocument } from "./schemas/user.schema";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
export declare class AuthService {
    private userModel;
    private jwtService;
    constructor(userModel: Model<UserDocument>, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        access_token: string;
        user: {
            id: import("mongoose").Types.ObjectId;
            name: string;
            email: string;
            role: import("./schemas/user.schema").UserRole;
        };
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: import("mongoose").Types.ObjectId;
            name: string;
            email: string;
            role: import("./schemas/user.schema").UserRole;
        };
    }>;
    createMemberAccount(data: {
        name: string;
        email: string;
        password: string;
        phone?: string;
    }): Promise<import("mongoose").Document<unknown, {}, UserDocument, {}, {}> & User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    profile(userId: string): Promise<{
        id: import("mongoose").Types.ObjectId;
        name: string;
        email: string;
        phone: string;
        role: import("./schemas/user.schema").UserRole;
    }>;
    updateProfile(userId: string, dto: {
        name?: string;
        phone?: string;
        password?: string;
    }): Promise<{
        id: import("mongoose").Types.ObjectId;
        name: string;
        email: string;
        phone: string;
        role: import("./schemas/user.schema").UserRole;
    }>;
    private signToken;
}
