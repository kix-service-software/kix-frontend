import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "../KIXObjectType";

export class SysConfigOption extends KIXObject<SysConfigOption> {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.SYS_CONFIG_OPTION;

    public Name: string;

    public Value: any;

    public constructor(sysConfigOption?: SysConfigOption) {
        super();
        if (sysConfigOption) {
            this.Name = sysConfigOption.Name;
            this.ObjectId = this.Name;
            this.Value = sysConfigOption.Value;
        }
    }

    public equals(object: SysConfigOption): boolean {
        return object.Name === this.Name;
    }

}
