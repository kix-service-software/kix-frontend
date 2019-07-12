import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "../KIXObjectType";
import { NotificationData } from "./NotificationData";

export class Notification extends KIXObject<Notification> {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.NOTIFICATION;

    public Data: NotificationData;

    public ID: number;

    public Message: any;

    public Name: string;

    public constructor(notification?: Notification) {
        super(notification);
        if (notification) {
            this.ID = notification.ID;
            this.Name = notification.Name;
            this.Data = notification.Data;
            this.Message = notification.Message;
        }
    }

}
