import { IEventSubscriber } from "./IEventSubscriber";

export class EventService {

    private static INSTANCE: EventService = null;
    private eventSubscribers: Map<string, IEventSubscriber[]> = new Map();

    public static getInstance(): EventService {
        if (!EventService.INSTANCE) {
            EventService.INSTANCE = new EventService();
        }

        return EventService.INSTANCE;
    }

    private constructor() { }

    public subscribe(eventId: string, subscriber: IEventSubscriber): void {
        if (this.eventSubscribers.has(eventId)) {
            const subscriberIndex = this.eventSubscribers.get(eventId).findIndex(
                (s) => s.eventSubscriberId === subscriber.eventSubscriberId
            );
            if (subscriberIndex !== -1) {
                this.eventSubscribers.get(eventId)[subscriberIndex] = subscriber;
            } else {
                this.eventSubscribers.get(eventId).push(subscriber);
            }
        } else {
            this.eventSubscribers.set(eventId, [subscriber]);
        }
    }

    public unsubscribe(eventId: string, subscriber: IEventSubscriber): void {
        if (subscriber && this.eventSubscribers.has(eventId)) {
            const subscriberIndex = this.eventSubscribers.get(eventId).findIndex(
                (s) => s.eventSubscriberId === subscriber.eventSubscriberId
            );
            if (subscriberIndex !== -1) {
                this.eventSubscribers.get(eventId).splice(subscriberIndex, 1);
            }
        }
    }

    public publish(eventId: string, data: any = {}, subscriberId?: string): void {
        if (this.eventSubscribers.has(eventId)) {
            this.eventSubscribers.get(eventId).forEach((l) => l.eventPublished(data, eventId, subscriberId));
        }
    }
}
