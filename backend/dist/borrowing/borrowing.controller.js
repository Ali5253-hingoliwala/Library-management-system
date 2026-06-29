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
exports.BorrowingController = void 0;
const common_1 = require("@nestjs/common");
const borrowing_service_1 = require("./borrowing.service");
const create_borrowing_dto_1 = require("./dto/create-borrowing.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const roles_guard_1 = require("../common/guards/roles.guard");
const user_schema_1 = require("../auth/schemas/user.schema");
let BorrowingController = class BorrowingController {
    constructor(borrowingService) {
        this.borrowingService = borrowingService;
    }
    findAll(status, memberId, bookId) {
        return this.borrowingService.findAll({ status, memberId, bookId });
    }
    findMine(user) {
        return this.borrowingService.findForUser(user);
    }
    requestBook(bookId, user) {
        return this.borrowingService.requestLoanForUser(bookId, user);
    }
    findOne(id) {
        return this.borrowingService.findOne(id);
    }
    createLoan(dto) {
        return this.borrowingService.createLoan(dto);
    }
    returnBook(id) {
        return this.borrowingService.returnBook(id);
    }
    approve(id, days) { return this.borrowingService.approveRequest(id, Number(days) || 14); }
    pay(id, amount, user) {
        return this.borrowingService.payFine(id, Number(amount), user, [user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.LIBRARIAN].includes(user.role));
    }
    markOverdue() {
        return this.borrowingService.markOverdue();
    }
};
exports.BorrowingController = BorrowingController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.LIBRARIAN),
    __param(0, (0, common_1.Query)("status")),
    __param(1, (0, common_1.Query)("memberId")),
    __param(2, (0, common_1.Query)("bookId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], BorrowingController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)("me/history"),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BorrowingController.prototype, "findMine", null);
__decorate([
    (0, common_1.Post)("request"),
    __param(0, (0, common_1.Body)("bookId")),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BorrowingController.prototype, "requestBook", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.LIBRARIAN),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BorrowingController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.LIBRARIAN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_borrowing_dto_1.CreateBorrowingDto]),
    __metadata("design:returntype", void 0)
], BorrowingController.prototype, "createLoan", null);
__decorate([
    (0, common_1.Patch)(":id/return"),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.LIBRARIAN),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BorrowingController.prototype, "returnBook", null);
__decorate([
    (0, common_1.Patch)(":id/approve"),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.LIBRARIAN),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)("days")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], BorrowingController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(":id/pay"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)("amount")),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Object]),
    __metadata("design:returntype", void 0)
], BorrowingController.prototype, "pay", null);
__decorate([
    (0, common_1.Patch)("mark-overdue"),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.LIBRARIAN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BorrowingController.prototype, "markOverdue", null);
exports.BorrowingController = BorrowingController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)("borrowing"),
    __metadata("design:paramtypes", [borrowing_service_1.BorrowingService])
], BorrowingController);
//# sourceMappingURL=borrowing.controller.js.map