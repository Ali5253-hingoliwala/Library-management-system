import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Borrowing, BorrowingDocument, LoanStatus } from "./schemas/borrowing.schema";
import { CreateBorrowingDto } from "./dto/create-borrowing.dto";
import { BooksService } from "../books/books.service";
import { MembersService } from "../members/members.service";
import { BookStatus } from "../books/schemas/book.schema";

const FINE_PER_DAY = 0.50;

@Injectable()
export class BorrowingService {
  constructor(
    @InjectModel(Borrowing.name) private borrowingModel: Model<BorrowingDocument>,
    private booksService: BooksService,
    private membersService: MembersService
  ) {}

  async createLoan(dto: CreateBorrowingDto): Promise<Borrowing> {
    const book = await this.booksService.findOne(dto.bookId) as any;
    if (book.availableCopies === 0) throw new BadRequestException("No copies available for borrowing");

    const loan = await this.borrowingModel.create({
      ...dto,
      borrowDate: new Date(),
      status: LoanStatus.ACTIVE,
    });

    await this.booksService.update(dto.bookId, {
      availableCopies: book.availableCopies - 1,
      status: book.availableCopies - 1 === 0 ? BookStatus.BORROWED : BookStatus.AVAILABLE,
    });
    await this.membersService.incrementBorrowCount(dto.memberId);

    return loan;
  }

  async requestLoanForUser(bookId: string, user: { name: string; email: string }): Promise<Borrowing> {
    const member = await this.membersService.findOrCreateForUser(user) as any;
    const duplicate = await this.borrowingModel.findOne({ bookId, memberId: member._id, status: { $in: [LoanStatus.REQUESTED, LoanStatus.ACTIVE, LoanStatus.OVERDUE] } });
    if (duplicate) throw new BadRequestException("You already have a pending or active request for this book");
    return this.borrowingModel.create({
      bookId,
      memberId: member._id.toString(),
      dueDate: new Date(),
      status: LoanStatus.REQUESTED,
      notes: "Requested by user",
    });
  }

  async approveRequest(id: string, days = 14) {
    const request = await this.borrowingModel.findById(id);
    if (!request || request.status !== LoanStatus.REQUESTED) throw new BadRequestException("Pending request not found");
    const book = await this.booksService.findOne(request.bookId.toString()) as any;
    if (!book.availableCopies) throw new BadRequestException("No copies available");
    const dueDate = new Date(); dueDate.setDate(dueDate.getDate() + Math.max(1, days));
    request.status = LoanStatus.ACTIVE; request.borrowDate = new Date(); request.dueDate = dueDate;
    await request.save();
    await this.booksService.update(request.bookId.toString(), { availableCopies: book.availableCopies - 1, status: book.availableCopies === 1 ? BookStatus.BORROWED : BookStatus.AVAILABLE });
    await this.membersService.incrementBorrowCount(request.memberId.toString());
    return request;
  }

  private async refreshFines(filter: Record<string, any> = {}) {
    const now = new Date();
    const overdue = await this.borrowingModel.find({ ...filter, status: { $in: [LoanStatus.ACTIVE, LoanStatus.OVERDUE] }, dueDate: { $lt: now } });
    for (const loan of overdue) { loan.status = LoanStatus.OVERDUE; loan.fine = Math.ceil((now.getTime() - loan.dueDate.getTime()) / 86400000) * FINE_PER_DAY; await loan.save(); }
  }

  async returnBook(loanId: string): Promise<Borrowing> {
    const loan = await this.borrowingModel.findById(loanId);
    if (!loan) throw new NotFoundException("Loan not found");
    if (loan.status === LoanStatus.RETURNED) throw new BadRequestException("Book already returned");

    const returnDate = new Date();
    const dueDate = new Date(loan.dueDate);
    let fine = 0;

    if (returnDate > dueDate) {
      const overdueDays = Math.ceil((returnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      fine = overdueDays * FINE_PER_DAY;
    }

    const updated = await this.borrowingModel.findByIdAndUpdate(
      loanId,
      { returnDate, status: LoanStatus.RETURNED, fine },
      { new: true }
    );

    const book = await this.booksService.findOne(loan.bookId.toString()) as any;
    await this.booksService.update(loan.bookId.toString(), {
      availableCopies: book.availableCopies + 1,
      status: BookStatus.AVAILABLE,
    });

    return updated!;
  }

  async findAll(query?: { status?: string; memberId?: string; bookId?: string }) {
    const filter: Record<string, any> = {};
    if (query?.status) filter.status = query.status;
    if (query?.memberId) filter.memberId = query.memberId;
    if (query?.bookId) filter.bookId = query.bookId;

    await this.refreshFines(filter);
    return this.borrowingModel
      .find(filter)
      .populate("bookId", "title author isbn")
      .populate("memberId", "name email")
      .sort({ createdAt: -1 });
  }

  async findForUser(user: { email: string }) {
    const member = await this.membersService.findByEmail(user.email);
    if (!member) return [];

    return this.findAll({ memberId: (member as any)._id.toString() });
  }

  async payFine(id: string, amount: number, user?: { email: string }, manager = false) {
    const loan = await this.borrowingModel.findById(id).populate("memberId", "email");
    if (!loan) throw new NotFoundException("Loan not found");
    if (!manager && (loan.memberId as any).email !== user?.email) throw new BadRequestException("This fine does not belong to you");
    const balance = Math.max(0, loan.fine - loan.paidAmount);
    if (amount <= 0 || amount > balance) throw new BadRequestException("Enter an amount up to the outstanding balance");
    loan.paidAmount += amount; await loan.save(); return loan;
  }

  async findOne(id: string): Promise<Borrowing> {
    const loan = await this.borrowingModel.findById(id)
      .populate("bookId", "title author isbn")
      .populate("memberId", "name email");
    if (!loan) throw new NotFoundException("Loan not found");
    return loan;
  }

  async markOverdue(): Promise<number> {
    const now = new Date();
    const result = await this.borrowingModel.updateMany(
      { status: LoanStatus.ACTIVE, dueDate: { $lt: now } },
      { status: LoanStatus.OVERDUE }
    );
    return result.modifiedCount;
  }
}
