export interface IEventSubscriber {

    eventSubscriberId: string;

    eventPublished(data: any, eventId: string, subscriberId?: string): void;

}
