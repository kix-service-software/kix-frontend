export interface IEventListener {

    eventSubscriberId: string;

    eventPublished(data: any, eventId: string): void;

}
