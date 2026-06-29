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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LibraryEventSchema = exports.LibraryEvent = exports.EventType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
var EventType;
(function (EventType) {
    EventType["WORKSHOP"] = "workshop";
    EventType["READING"] = "reading";
    EventType["EXHIBITION"] = "exhibition";
    EventType["LECTURE"] = "lecture";
    EventType["CHILDREN"] = "children";
})(EventType || (exports.EventType = EventType = {}));
let LibraryEvent = class LibraryEvent {
};
exports.LibraryEvent = LibraryEvent;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], LibraryEvent.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], LibraryEvent.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Date }),
    __metadata("design:type", Date)
], LibraryEvent.prototype, "date", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], LibraryEvent.prototype, "time", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], LibraryEvent.prototype, "location", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: EventType, required: true }),
    __metadata("design:type", String)
], LibraryEvent.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 1 }),
    __metadata("design:type", Number)
], LibraryEvent.prototype, "capacity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0, min: 0 }),
    __metadata("design:type", Number)
], LibraryEvent.prototype, "registered", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], LibraryEvent.prototype, "registeredUserIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], LibraryEvent.prototype, "isUpcoming", void 0);
exports.LibraryEvent = LibraryEvent = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], LibraryEvent);
exports.LibraryEventSchema = mongoose_1.SchemaFactory.createForClass(LibraryEvent);
//# sourceMappingURL=event.schema.js.map