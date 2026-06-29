import { EventsService } from "./events.service";
import { CreateEventDto } from "./dto/create-event.dto";
export declare class EventsController {
    private eventsService;
    constructor(eventsService: EventsService);
    findAll(upcoming?: string): Promise<import("./schemas/event.schema").LibraryEvent[]>;
    findOne(id: string): Promise<import("./schemas/event.schema").LibraryEvent>;
    create(dto: CreateEventDto): Promise<import("./schemas/event.schema").LibraryEvent>;
    update(id: string, dto: Partial<CreateEventDto>): Promise<import("./schemas/event.schema").LibraryEvent>;
    registerForEvent(id: string, user: any): Promise<import("./schemas/event.schema").LibraryEvent>;
    remove(id: string): Promise<void>;
}
