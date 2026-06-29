import { ConfigService } from "@nestjs/config";
import { Model } from "mongoose";
import { Strategy } from "passport-jwt";
import { UserDocument } from "../schemas/user.schema";
interface JwtPayload {
    sub: string;
    email: string;
    role: string;
}
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private userModel;
    constructor(config: ConfigService, userModel: Model<UserDocument>);
    validate(payload: JwtPayload): Promise<{
        id: import("mongoose").Types.ObjectId;
        name: string;
        email: string;
        role: import("../schemas/user.schema").UserRole;
    }>;
}
export {};
