import { SysConfigOption } from "./SysConfigOption";
import { ObjectFactory } from "../../../services/object-factories/ObjectFactory";
import { KIXObjectType } from "../KIXObjectType";

export class SysConfigOptionFactory extends ObjectFactory<SysConfigOption> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.SYS_CONFIG_OPTION;
    }

    public create(sysConfigOption?: SysConfigOption): SysConfigOption {
        return new SysConfigOption(sysConfigOption);
    }



}
