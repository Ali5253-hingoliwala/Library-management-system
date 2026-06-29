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
exports.MembersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const member_schema_1 = require("./schemas/member.schema");
const auth_service_1 = require("../auth/auth.service");
let MembersService = class MembersService {
    constructor(memberModel, authService) {
        this.memberModel = memberModel;
        this.authService = authService;
    }
    async create(dto) {
        const exists = await this.memberModel.findOne({ email: dto.email });
        if (exists)
            throw new common_1.ConflictException("Email already registered");
        const { password, ...member } = dto;
        if (!password)
            throw new common_1.ConflictException("Set a password so the member can log in");
        await this.authService.createMemberAccount({ name: dto.name, email: dto.email, password, phone: dto.phone });
        return this.memberModel.create(member);
    }
    async findAll(query) {
        const filter = {};
        if (query?.status)
            filter.status = query.status;
        if (query?.type)
            filter.membershipType = query.type;
        if (query?.search)
            filter.$text = { $search: query.search };
        return this.memberModel.find(filter).sort({ createdAt: -1 });
    }
    async findOne(id) {
        const member = await this.memberModel.findById(id);
        if (!member)
            throw new common_1.NotFoundException(`Member ${id} not found`);
        return member;
    }
    async findByEmail(email) {
        return this.memberModel.findOne({ email: email.toLowerCase() });
    }
    async findOrCreateForUser(user) {
        const existing = await this.findByEmail(user.email);
        if (existing)
            return existing;
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        return this.memberModel.create({
            name: user.name,
            email: user.email,
            membershipType: "standard",
            expiryDate: nextYear,
            status: "active",
        });
    }
    async update(id, dto) {
        const member = await this.memberModel.findByIdAndUpdate(id, dto, { new: true });
        if (!member)
            throw new common_1.NotFoundException(`Member ${id} not found`);
        return member;
    }
    async remove(id) {
        const result = await this.memberModel.findByIdAndDelete(id);
        if (!result)
            throw new common_1.NotFoundException(`Member ${id} not found`);
    }
    async incrementBorrowCount(id) {
        await this.memberModel.findByIdAndUpdate(id, { $inc: { borrowedCount: 1 } });
    }
};
exports.MembersService = MembersService;
exports.MembersService = MembersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(member_schema_1.Member.name)),
    __metadata("design:paramtypes", [mongoose_2.Model, auth_service_1.AuthService])
], MembersService);
//# sourceMappingURL=members.service.js.map