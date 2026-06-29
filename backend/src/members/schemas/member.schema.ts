import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type MemberDocument = Member & Document;

export enum MembershipType {
  STANDARD = "standard",
  PREMIUM = "premium",
  STUDENT = "student",
  SENIOR = "senior",
}

export enum MemberStatus {
  ACTIVE = "active",
  SUSPENDED = "suspended",
  EXPIRED = "expired",
}

@Schema({ timestamps: true })
export class Member {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ type: String, enum: MembershipType, default: MembershipType.STANDARD })
  membershipType: MembershipType;

  @Prop({ required: true, type: Date })
  expiryDate: Date;

  @Prop({ type: String, enum: MemberStatus, default: MemberStatus.ACTIVE })
  status: MemberStatus;

  @Prop({ default: 0, min: 0 })
  borrowedCount: number;
}

export const MemberSchema = SchemaFactory.createForClass(Member);
MemberSchema.index({ name: "text", email: "text" });
