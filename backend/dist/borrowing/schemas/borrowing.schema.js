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
exports.BorrowingSchema = exports.Borrowing = exports.LoanStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var LoanStatus;
(function (LoanStatus) {
    LoanStatus["REQUESTED"] = "requested";
    LoanStatus["ACTIVE"] = "active";
    LoanStatus["RETURNED"] = "returned";
    LoanStatus["OVERDUE"] = "overdue";
})(LoanStatus || (exports.LoanStatus = LoanStatus = {}));
let Borrowing = class Borrowing {
};
exports.Borrowing = Borrowing;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: "Book", required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Borrowing.prototype, "bookId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: "Member", required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Borrowing.prototype, "memberId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Date, default: Date.now }),
    __metadata("design:type", Date)
], Borrowing.prototype, "borrowDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Date }),
    __metadata("design:type", Date)
], Borrowing.prototype, "dueDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Borrowing.prototype, "returnDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: LoanStatus, default: LoanStatus.ACTIVE }),
    __metadata("design:type", String)
], Borrowing.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, min: 0, default: 0 }),
    __metadata("design:type", Number)
], Borrowing.prototype, "fine", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, min: 0, default: 0 }),
    __metadata("design:type", Number)
], Borrowing.prototype, "paidAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Borrowing.prototype, "notes", void 0);
exports.Borrowing = Borrowing = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Borrowing);
exports.BorrowingSchema = mongoose_1.SchemaFactory.createForClass(Borrowing);
//# sourceMappingURL=borrowing.schema.js.map