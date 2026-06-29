"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const jwt_1 = require("@nestjs/jwt");
const mongoose_2 = require("mongoose");
const bcrypt = require("bcryptjs");
const user_schema_1 = require("./schemas/user.schema");
let AuthService = class AuthService {
    constructor(userModel, jwtService) {
        this.userModel = userModel;
        this.jwtService = jwtService;
    }
    async register(dto) {
        const exists = await this.userModel.findOne({ email: dto.email });
        if (exists)
            throw new common_1.ConflictException("Email already registered");
        const hashed = await bcrypt.hash(dto.password, 12);
        const user = await this.userModel.create({ ...dto, password: hashed });
        return this.signToken(user);
    }
    async login(dto) {
        const user = await this.userModel.findOne({ email: dto.email }).select("+password");
        if (!user)
            throw new common_1.UnauthorizedException("Invalid credentials");
        const valid = await bcrypt.compare(dto.password, user.password);
        if (!valid)
            throw new common_1.UnauthorizedException("Invalid credentials");
        return this.signToken(user);
    }
    async createMemberAccount(data) {
        const exists = await this.userModel.findOne({ email: data.email.toLowerCase() });
        if (exists)
            throw new common_1.ConflictException("A login already exists for this email");
        return this.userModel.create({ ...data, password: await bcrypt.hash(data.password, 12), role: "user" });
    }
    async profile(userId) {
        const user = await this.userModel.findById(userId);
        if (!user)
            throw new common_1.NotFoundException("User not found");
        return { id: user._id, name: user.name, email: user.email, phone: user.phone ?? "", role: user.role };
    }
    async updateProfile(userId, dto) {
        const update = { ...dto };
        if (dto.password)
            update.password = await bcrypt.hash(dto.password, 12);
        else
            delete update.password;
        const user = await this.userModel.findByIdAndUpdate(userId, update, { new: true });
        if (!user)
            throw new common_1.NotFoundException("User not found");
        return { id: user._id, name: user.name, email: user.email, phone: user.phone ?? "", role: user.role };
    }
    signToken(user) {
        const payload = { sub: user._id.toString(), email: user.email, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map