import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "../KIXObjectType";

export class SysConfigItem extends KIXObject<SysConfigItem> {
    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.SYS_CONFIG_ITEM;

    public ID: string;

    public Data: any;

    public constructor(sysConfigItem?: SysConfigItem) {
        super();
        if (sysConfigItem) {
            this.ID = sysConfigItem.ID;
            this.ObjectId = this.ID;
            this.Data = sysConfigItem.Data;
        }
    }

    public equals(object: SysConfigItem): boolean {
        return object.ID === this.ID;
    }

}
