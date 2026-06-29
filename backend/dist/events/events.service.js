"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const event_schema_1 = require("./schemas/event.schema");
let EventsService = class EventsService {
    constructor(eventModel) {
        this.eventModel = eventModel;
    }
    async create(dto) {
        return this.eventModel.create(dto);
    }
    async findAll(upcoming) {
        const filter = {};
        if (upcoming !== undefined)
            filter.isUpcoming = upcoming;
        return this.eventModel.find(filter).sort({ date: 1 });
    }
    async findOne(id) {
        const event = await this.eventModel.findById(id);
        if (!event)
            throw new common_1.NotFoundException("Event not found");
        return event;
    }
    async update(id, dto) {
        const event = await this.eventModel.findByIdAndUpdate(id, dto, { new: true });
        if (!event)
            throw new common_1.NotFoundException("Event not found");
        return event;
    }
    async remove(id) {
        const result = await this.eventModel.findByIdAndDelete(id);
        if (!result)
            throw new common_1.NotFoundException("Event not found");
    }
    async registerForEvent(id, userId) {
        const event = await this.eventModel.findById(id);
        if (!event)
            throw new common_1.NotFoundException("Event not found");
        if (event.registered >= event.capacity)
            throw new common_1.BadRequestException("Event is at full capacity");
        if (event.registeredUserIds?.includes(userId))
            throw new common_1.BadRequestException("You already registered interest");
        return this.eventModel.findByIdAndUpdate(id, { $inc: { registered: 1 }, $addToSet: { registeredUserIds: userId } }, { new: true });
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(event_schema_1.LibraryEvent.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], EventsService);
//# sourceMappingURL=events.service.js.map