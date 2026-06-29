import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type BorrowingDocument = Borrowing & Document;

export enum LoanStatus {
  REQUESTED = "requested",
  ACTIVE = "active",
  RETURNED = "returned",
  OVERDUE = "overdue",
}

@Schema({ timestamps: true })
export class Borrowing {
  @Prop({ type: Types.ObjectId, ref: "Book", required: true })
  bookId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Member", required: true })
  memberId: Types.ObjectId;

  @Prop({ required: true, type: Date, default: Date.now })
  borrowDate: Date;

  @Prop({ required: true, type: Date })
  dueDate: Date;

  @Prop({ type: Date })
  returnDate?: Date;

  @Prop({ type: String, enum: LoanStatus, default: LoanStatus.ACTIVE })
  status: LoanStatus;

  @Prop({ type: Number, min: 0, default: 0 })
  fine: number;

  @Prop({ type: Number, min: 0, default: 0 })
  paidAmount: number;

  @Prop({ trim: true })
  notes?: string;
}

export const BorrowingSchema = SchemaFactory.createForClass(Borrowing);
