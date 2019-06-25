import { ObjectFactory } from "./ObjectFactory";
import { SysConfigOption, KIXObjectType } from "../../model";

export class SysConfigOptionFactory extends ObjectFactory<SysConfigOption> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.SYS_CONFIG_OPTION;
    }

    public create(sysConfigOption?: SysConfigOption): SysConfigOption {
        return new SysConfigOption(sysConfigOption);
    }



}
