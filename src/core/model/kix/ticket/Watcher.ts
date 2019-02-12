import { KIXObject } from '../KIXObject';
import { KIXObjectType } from '..';

export class Watcher extends KIXObject<Watcher> {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.WATCHER;

    public ID: number;

    public TicketID: number;

    public UserID: number;

    public CreateBy: number;

    public CreateTime: string;

    public ChangeBy: number;

    public ChangeTime: string;

    public constructor(watcher?: Watcher) {
        super();

        if (watcher) {
            this.ID = Number(watcher.ID);
            this.TicketID = Number(watcher.TicketID);
            this.ObjectId = this.ID;
            this.UserID = watcher.UserID;
            this.CreateBy = watcher.CreateBy;
            this.CreateTime = watcher.CreateTime;
            this.ChangeBy = watcher.ChangeBy;
            this.ChangeTime = watcher.ChangeTime;
        }
    }

    public equals(watcher: Watcher): boolean {
        return this.ID === watcher.ID;
    }
}
