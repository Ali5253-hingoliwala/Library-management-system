import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { EventsController } from "./events.controller";
import { EventsService } from "./events.service";
import { LibraryEvent, LibraryEventSchema } from "./schemas/event.schema";

@Module({
  imports: [MongooseModule.forFeature([{ name: LibraryEvent.name, schema: LibraryEventSchema }])],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
