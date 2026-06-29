import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { BorrowingController } from "./borrowing.controller";
import { BorrowingService } from "./borrowing.service";
import { Borrowing, BorrowingSchema } from "./schemas/borrowing.schema";
import { BooksModule } from "../books/books.module";
import { MembersModule } from "../members/members.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Borrowing.name, schema: BorrowingSchema }]),
    BooksModule,
    MembersModule,
  ],
  controllers: [BorrowingController],
  providers: [BorrowingService],
})
export class BorrowingModule {}
