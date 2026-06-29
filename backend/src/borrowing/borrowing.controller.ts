import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { BorrowingService } from "./borrowing.service";
import { CreateBorrowingDto } from "./dto/create-borrowing.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { UserRole } from "../auth/schemas/user.schema";

@UseGuards(JwtAuthGuard)
@Controller("borrowing")
export class BorrowingController {
  constructor(private borrowingService: BorrowingService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  findAll(
    @Query("status") status?: string,
    @Query("memberId") memberId?: string,
    @Query("bookId") bookId?: string
  ) {
    return this.borrowingService.findAll({ status, memberId, bookId });
  }

  @Get("me/history")
  findMine(@CurrentUser() user: { email: string }) {
    return this.borrowingService.findForUser(user);
  }

  @Post("request")
  requestBook(@Body("bookId") bookId: string, @CurrentUser() user: { name: string; email: string }) {
    return this.borrowingService.requestLoanForUser(bookId, user);
  }

  @Get(":id")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  findOne(@Param("id") id: string) {
    return this.borrowingService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  createLoan(@Body() dto: CreateBorrowingDto) {
    return this.borrowingService.createLoan(dto);
  }

  @Patch(":id/return")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  returnBook(@Param("id") id: string) {
    return this.borrowingService.returnBook(id);
  }

  @Patch(":id/approve")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  approve(@Param("id") id: string, @Body("days") days?: number) { return this.borrowingService.approveRequest(id, Number(days) || 14); }

  @Post(":id/pay")
  pay(@Param("id") id: string, @Body("amount") amount: number, @CurrentUser() user: any) {
    return this.borrowingService.payFine(id, Number(amount), user, [UserRole.ADMIN, UserRole.LIBRARIAN].includes(user.role));
  }

  @Patch("mark-overdue")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  markOverdue() {
    return this.borrowingService.markOverdue();
  }
}
