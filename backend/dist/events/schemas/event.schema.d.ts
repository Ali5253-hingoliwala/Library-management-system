import { Document } from "mongoose";
export type EventDocument = LibraryEvent & Document;
export declare enum EventType {
    WORKSHOP = "workshop",
    READING = "reading",
    EXHIBITION = "exhibition",
    LECTURE = "lecture",
    CHILDREN = "children"
}
export declare class LibraryEvent {
    title: string;
    description: string;
    date: Date;
    time: string;
    location: string;
    type: EventType;
    capacity: number;
    registered: number;
    registeredUserIds: string[];
    isUpcoming: boolean;
}
export declare const LibraryEventSchema: import("mongoose").Schema<LibraryEvent, import("mongoose").Model<LibraryEvent, any, any, any, Document<unknown, any, LibraryEvent, any, {}> & LibraryEvent & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, LibraryEvent, Document<unknown, {}, import("mongoose").FlatRecord<LibraryEvent>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<LibraryEvent> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
