import { EventType } from "../schemas/event.schema";
export declare class CreateEventDto {
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    type: EventType;
    capacity: number;
}
