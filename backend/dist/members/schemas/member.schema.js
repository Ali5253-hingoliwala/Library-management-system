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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemberSchema = exports.Member = exports.MemberStatus = exports.MembershipType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
var MembershipType;
(function (MembershipType) {
    MembershipType["STANDARD"] = "standard";
    MembershipType["PREMIUM"] = "premium";
    MembershipType["STUDENT"] = "student";
    MembershipType["SENIOR"] = "senior";
})(MembershipType || (exports.MembershipType = MembershipType = {}));
var MemberStatus;
(function (MemberStatus) {
    MemberStatus["ACTIVE"] = "active";
    MemberStatus["SUSPENDED"] = "suspended";
    MemberStatus["EXPIRED"] = "expired";
})(MemberStatus || (exports.MemberStatus = MemberStatus = {}));
let Member = class Member {
};
exports.Member = Member;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Member.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, lowercase: true, trim: true }),
    __metadata("design:type", String)
], Member.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Member.prototype, "phone", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: MembershipType, default: MembershipType.STANDARD }),
    __metadata("design:type", String)
], Member.prototype, "membershipType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Date }),
    __metadata("design:type", Date)
], Member.prototype, "expiryDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: MemberStatus, default: MemberStatus.ACTIVE }),
    __metadata("design:type", String)
], Member.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0, min: 0 }),
    __metadata("design:type", Number)
], Member.prototype, "borrowedCount", void 0);
exports.Member = Member = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Member);
exports.MemberSchema = mongoose_1.SchemaFactory.createForClass(Member);
exports.MemberSchema.index({ name: "text", email: "text" });
//# sourceMappingURL=member.schema.js.map