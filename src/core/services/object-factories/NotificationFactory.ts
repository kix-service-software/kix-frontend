import { ObjectFactory } from "./ObjectFactory";
import { Notification, KIXObjectType } from "../../model";

export class NotificationFactory extends ObjectFactory<Notification> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.NOTIFICATION;
    }

    public create(notification: Notification): Notification {
        return new Notification(notification);
    }

}
