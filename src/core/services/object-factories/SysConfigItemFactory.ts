import { ObjectFactory } from "./ObjectFactory";
import { SysConfigItem, KIXObjectType } from "../../model";

export class SysConfigItemFactory extends ObjectFactory<SysConfigItem> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.SYS_CONFIG_ITEM;
    }

    public create(sysConfigItem?: SysConfigItem): SysConfigItem {
        return new SysConfigItem(sysConfigItem);
    }



}
