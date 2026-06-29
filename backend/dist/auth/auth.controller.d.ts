import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
    getMe(user: any): Promise<{
        id: import("mongoose").Types.ObjectId;
        name: string;
        email: string;
        phone: string;
        role: import("./schemas/user.schema").UserRole;
    }>;
    updateMe(user: any, body: {
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
}
