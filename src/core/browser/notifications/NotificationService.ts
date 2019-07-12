import { KIXObjectService } from "../kix";
import { SystemAddress, KIXObjectType } from "../../model";

export class NotificationService extends KIXObjectService<SystemAddress> {

    private static INSTANCE: NotificationService = null;

    public static getInstance(): NotificationService {
        if (!NotificationService.INSTANCE) {
            NotificationService.INSTANCE = new NotificationService();
        }

        return NotificationService.INSTANCE;
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.NOTIFICATION;
    }

    public getLinkObjectName(): string {
        return 'Notification';
    }

}
