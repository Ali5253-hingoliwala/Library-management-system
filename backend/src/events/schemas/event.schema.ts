import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type EventDocument = LibraryEvent & Document;

export enum EventType {
  WORKSHOP = "workshop",
  READING = "reading",
  EXHIBITION = "exhibition",
  LECTURE = "lecture",
  CHILDREN = "children",
}

@Schema({ timestamps: true })
export class LibraryEvent {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, type: Date })
  date: Date;

  @Prop({ required: true })
  time: string;

  @Prop({ required: true })
  location: string;

  @Prop({ type: String, enum: EventType, required: true })
  type: EventType;

  @Prop({ required: true, min: 1 })
  capacity: number;

  @Prop({ default: 0, min: 0 })
  registered: number;

  @Prop({ type: [String], default: [] })
  registeredUserIds: string[];

  @Prop({ default: true })
  isUpcoming: boolean;
}

export const LibraryEventSchema = SchemaFactory.createForClass(LibraryEvent);
