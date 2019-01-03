import { IEventListener } from "./IEventListener";

export class EventService {

    private static INSTANCE: EventService = null;
    private listener: Map<string, IEventListener[]> = new Map();

    public static getInstance(): EventService {
        if (!EventService.INSTANCE) {
            EventService.INSTANCE = new EventService();
        }

        return EventService.INSTANCE;
    }

    private constructor() { }

    public subscribe(eventId: string, listener: IEventListener): void {
        if (this.listener.has(eventId)) {
            const subscriberIndex = this.listener.get(eventId).findIndex(
                (s) => s.eventSubscriberId === listener.eventSubscriberId
            );
            if (subscriberIndex !== -1) {
                this.listener.get(eventId)[subscriberIndex] = listener;
            } else {
                this.listener.get(eventId).push(listener);
            }
        } else {
            this.listener.set(eventId, [listener]);
        }
    }

    public unsubscribe(eventId: string, listener: IEventListener): void {
        if (this.listener.has(eventId)) {
            const subscriberIndex = this.listener.get(eventId).findIndex(
                (s) => s.eventSubscriberId === listener.eventSubscriberId
            );
            if (subscriberIndex !== -1) {
                this.listener.get(eventId).splice(subscriberIndex, 1);
            }
        }
    }

    public publish(eventId: string, data: any = {}): void {
        if (this.listener.has(eventId)) {
            this.listener.get(eventId).forEach((l) => l.eventPublished(data, eventId));
        }
    }
}
