import { IObjectFactory } from "../IObjectFactory";
import { SysConfigItem } from "./SysConfigItem";
import { KIXObjectType } from "../KIXObjectType";

export class SysConfigItemFactory implements IObjectFactory<SysConfigItem> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.SYS_CONFIG_ITEM;
    }

    public create(sysConfigItem?: SysConfigItem): SysConfigItem {
        return new SysConfigItem(sysConfigItem);
    }



}
