import { IObjectFactory } from "../IObjectFactory";
import { SysConfigOptionDefinition } from "./SysConfigOptionDefinition";
import { KIXObjectType } from "../KIXObjectType";

export class SysConfigOptionDefinitionFactory implements IObjectFactory<SysConfigOptionDefinition> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.SYS_CONFIG_OPTION_DEFINITION;
    }

    public create(sysConfigOptionDefinition?: SysConfigOptionDefinition): SysConfigOptionDefinition {
        return new SysConfigOptionDefinition(sysConfigOptionDefinition);
    }



}
