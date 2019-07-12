import { Notification } from "../../model";
import { KIXObjectFactory } from "../kix/KIXObjectFactory";

export class NotificationBrowserFactory extends KIXObjectFactory<Notification> {

    private static INSTANCE: NotificationBrowserFactory;

    public static getInstance(): NotificationBrowserFactory {
        if (!NotificationBrowserFactory.INSTANCE) {
            NotificationBrowserFactory.INSTANCE = new NotificationBrowserFactory();
        }
        return NotificationBrowserFactory.INSTANCE;
    }

    private constructor() {
        super();
    }

    public async create(notification: Notification): Promise<Notification> {
        const newNotification = new Notification(notification);
        return newNotification;
    }

}
