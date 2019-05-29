import { ObjectUpdatedEvent } from "./ObjectUpdatedEvent";

export class ObjectUpdatedEventData {

    public RequestID: string;
    public Namespace: string;
    public ObjectID: string;
    public Timestamp: string;
    public Event: ObjectUpdatedEvent;
    public ObjectType: string;

}
