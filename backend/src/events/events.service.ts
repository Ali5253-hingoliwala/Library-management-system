import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { LibraryEvent, EventDocument } from "./schemas/event.schema";
import { CreateEventDto } from "./dto/create-event.dto";

@Injectable()
export class EventsService {
  constructor(@InjectModel(LibraryEvent.name) private eventModel: Model<EventDocument>) {}

  async create(dto: CreateEventDto): Promise<LibraryEvent> {
    return this.eventModel.create(dto);
  }

  async findAll(upcoming?: boolean): Promise<LibraryEvent[]> {
    const filter: Record<string, any> = {};
    if (upcoming !== undefined) filter.isUpcoming = upcoming;
    return this.eventModel.find(filter).sort({ date: 1 });
  }

  async findOne(id: string): Promise<LibraryEvent> {
    const event = await this.eventModel.findById(id);
    if (!event) throw new NotFoundException("Event not found");
    return event;
  }

  async update(id: string, dto: Partial<CreateEventDto>): Promise<LibraryEvent> {
    const event = await this.eventModel.findByIdAndUpdate(id, dto, { new: true });
    if (!event) throw new NotFoundException("Event not found");
    return event;
  }

  async remove(id: string): Promise<void> {
    const result = await this.eventModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException("Event not found");
  }

  async registerForEvent(id: string, userId: string): Promise<LibraryEvent> {
    const event = await this.eventModel.findById(id);
    if (!event) throw new NotFoundException("Event not found");
    if (event.registered >= event.capacity) throw new BadRequestException("Event is at full capacity");
    if (event.registeredUserIds?.includes(userId)) throw new BadRequestException("You already registered interest");
    return this.eventModel.findByIdAndUpdate(id, { $inc: { registered: 1 }, $addToSet: { registeredUserIds: userId } }, { new: true }) as Promise<LibraryEvent>;
  }
}
