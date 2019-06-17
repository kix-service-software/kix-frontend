import { IObjectFactory } from "../IObjectFactory";
import { SysConfigOption } from "./SysConfigOption";
import { KIXObjectType } from "../KIXObjectType";

export class SysConfigOptionFactory implements IObjectFactory<SysConfigOption> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.SYS_CONFIG_OPTION;
    }

    public create(sysConfigOption?: SysConfigOption): SysConfigOption {
        return new SysConfigOption(sysConfigOption);
    }



}
