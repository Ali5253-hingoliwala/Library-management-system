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
exports.BorrowingService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const borrowing_schema_1 = require("./schemas/borrowing.schema");
const books_service_1 = require("../books/books.service");
const members_service_1 = require("../members/members.service");
const book_schema_1 = require("../books/schemas/book.schema");
const FINE_PER_DAY = 0.50;
let BorrowingService = class BorrowingService {
    constructor(borrowingModel, booksService, membersService) {
        this.borrowingModel = borrowingModel;
        this.booksService = booksService;
        this.membersService = membersService;
    }
    async createLoan(dto) {
        const book = await this.booksService.findOne(dto.bookId);
        if (book.availableCopies === 0)
            throw new common_1.BadRequestException("No copies available for borrowing");
        const loan = await this.borrowingModel.create({
            ...dto,
            borrowDate: new Date(),
            status: borrowing_schema_1.LoanStatus.ACTIVE,
        });
        await this.booksService.update(dto.bookId, {
            availableCopies: book.availableCopies - 1,
            status: book.availableCopies - 1 === 0 ? book_schema_1.BookStatus.BORROWED : book_schema_1.BookStatus.AVAILABLE,
        });
        await this.membersService.incrementBorrowCount(dto.memberId);
        return loan;
    }
    async requestLoanForUser(bookId, user) {
        const member = await this.membersService.findOrCreateForUser(user);
        const duplicate = await this.borrowingModel.findOne({ bookId, memberId: member._id, status: { $in: [borrowing_schema_1.LoanStatus.REQUESTED, borrowing_schema_1.LoanStatus.ACTIVE, borrowing_schema_1.LoanStatus.OVERDUE] } });
        if (duplicate)
            throw new common_1.BadRequestException("You already have a pending or active request for this book");
        return this.borrowingModel.create({
            bookId,
            memberId: member._id.toString(),
            dueDate: new Date(),
            status: borrowing_schema_1.LoanStatus.REQUESTED,
            notes: "Requested by user",
        });
    }
    async approveRequest(id, days = 14) {
        const request = await this.borrowingModel.findById(id);
        if (!request || request.status !== borrowing_schema_1.LoanStatus.REQUESTED)
            throw new common_1.BadRequestException("Pending request not found");
        const book = await this.booksService.findOne(request.bookId.toString());
        if (!book.availableCopies)
            throw new common_1.BadRequestException("No copies available");
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + Math.max(1, days));
        request.status = borrowing_schema_1.LoanStatus.ACTIVE;
        request.borrowDate = new Date();
        request.dueDate = dueDate;
        await request.save();
        await this.booksService.update(request.bookId.toString(), { availableCopies: book.availableCopies - 1, status: book.availableCopies === 1 ? book_schema_1.BookStatus.BORROWED : book_schema_1.BookStatus.AVAILABLE });
        await this.membersService.incrementBorrowCount(request.memberId.toString());
        return request;
    }
    async refreshFines(filter = {}) {
        const now = new Date();
        const overdue = await this.borrowingModel.find({ ...filter, status: { $in: [borrowing_schema_1.LoanStatus.ACTIVE, borrowing_schema_1.LoanStatus.OVERDUE] }, dueDate: { $lt: now } });
        for (const loan of overdue) {
            loan.status = borrowing_schema_1.LoanStatus.OVERDUE;
            loan.fine = Math.ceil((now.getTime() - loan.dueDate.getTime()) / 86400000) * FINE_PER_DAY;
            await loan.save();
        }
    }
    async returnBook(loanId) {
        const loan = await this.borrowingModel.findById(loanId);
        if (!loan)
            throw new common_1.NotFoundException("Loan not found");
        if (loan.status === borrowing_schema_1.LoanStatus.RETURNED)
            throw new common_1.BadRequestException("Book already returned");
        const returnDate = new Date();
        const dueDate = new Date(loan.dueDate);
        let fine = 0;
        if (returnDate > dueDate) {
            const overdueDays = Math.ceil((returnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
            fine = overdueDays * FINE_PER_DAY;
        }
        const updated = await this.borrowingModel.findByIdAndUpdate(loanId, { returnDate, status: borrowing_schema_1.LoanStatus.RETURNED, fine }, { new: true });
        const book = await this.booksService.findOne(loan.bookId.toString());
        await this.booksService.update(loan.bookId.toString(), {
            availableCopies: book.availableCopies + 1,
            status: book_schema_1.BookStatus.AVAILABLE,
        });
        return updated;
    }
    async findAll(query) {
        const filter = {};
        if (query?.status)
            filter.status = query.status;
        if (query?.memberId)
            filter.memberId = query.memberId;
        if (query?.bookId)
            filter.bookId = query.bookId;
        await this.refreshFines(filter);
        return this.borrowingModel
            .find(filter)
            .populate("bookId", "title author isbn")
            .populate("memberId", "name email")
            .sort({ createdAt: -1 });
    }
    async findForUser(user) {
        const member = await this.membersService.findByEmail(user.email);
        if (!member)
            return [];
        return this.findAll({ memberId: member._id.toString() });
    }
    async payFine(id, amount, user, manager = false) {
        const loan = await this.borrowingModel.findById(id).populate("memberId", "email");
        if (!loan)
            throw new common_1.NotFoundException("Loan not found");
        if (!manager && loan.memberId.email !== user?.email)
            throw new common_1.BadRequestException("This fine does not belong to you");
        const balance = Math.max(0, loan.fine - loan.paidAmount);
        if (amount <= 0 || amount > balance)
            throw new common_1.BadRequestException("Enter an amount up to the outstanding balance");
        loan.paidAmount += amount;
        await loan.save();
        return loan;
    }
    async findOne(id) {
        const loan = await this.borrowingModel.findById(id)
            .populate("bookId", "title author isbn")
            .populate("memberId", "name email");
        if (!loan)
            throw new common_1.NotFoundException("Loan not found");
        return loan;
    }
    async markOverdue() {
        const now = new Date();
        const result = await this.borrowingModel.updateMany({ status: borrowing_schema_1.LoanStatus.ACTIVE, dueDate: { $lt: now } }, { status: borrowing_schema_1.LoanStatus.OVERDUE });
        return result.modifiedCount;
    }
};
exports.BorrowingService = BorrowingService;
exports.BorrowingService = BorrowingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(borrowing_schema_1.Borrowing.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        books_service_1.BooksService,
        members_service_1.MembersService])
], BorrowingService);
//# sourceMappingURL=borrowing.service.js.map