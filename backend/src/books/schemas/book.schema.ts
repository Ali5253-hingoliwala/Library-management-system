import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type BookDocument = Book & Document;

export enum BookStatus {
  AVAILABLE = "available",
  BORROWED = "borrowed",
  RESERVED = "reserved",
  DAMAGED = "damaged",
}

@Schema({ timestamps: true })
export class Book {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  author: string;

  @Prop({ required: true, unique: true, trim: true })
  isbn: string;

  @Prop({ required: true })
  genre: string;

  @Prop({ required: true, min: 1000, max: 2100 })
  publishedYear: number;

  @Prop({ required: true, min: 1 })
  totalCopies: number;

  @Prop({ required: true, min: 0 })
  availableCopies: number;

  @Prop({ type: String, enum: BookStatus, default: BookStatus.AVAILABLE })
  status: BookStatus;

  @Prop({ trim: true })
  description?: string;

  @Prop({ trim: true })
  coverUrl?: string;
}

export const BookSchema = SchemaFactory.createForClass(Book);

// Text index for full-text search
BookSchema.index({ title: "text", author: "text", genre: "text" });
