import { Model } from "mongoose";
import { LibraryEvent, EventDocument } from "./schemas/event.schema";
import { CreateEventDto } from "./dto/create-event.dto";
export declare class EventsService {
    private eventModel;
    constructor(eventModel: Model<EventDocument>);
    create(dto: CreateEventDto): Promise<LibraryEvent>;
    findAll(upcoming?: boolean): Promise<LibraryEvent[]>;
    findOne(id: string): Promise<LibraryEvent>;
    update(id: string, dto: Partial<CreateEventDto>): Promise<LibraryEvent>;
    remove(id: string): Promise<void>;
    registerForEvent(id: string, userId: string): Promise<LibraryEvent>;
}
