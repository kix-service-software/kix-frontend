import { ObjectFactory } from "./ObjectFactory";
import { SysConfigOptionDefinition, KIXObjectType } from "../../model";

export class SysConfigOptionDefinitionFactory extends ObjectFactory<SysConfigOptionDefinition> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.SYS_CONFIG_OPTION_DEFINITION;
    }

    public create(sysConfigOptionDefinition?: SysConfigOptionDefinition): SysConfigOptionDefinition {
        return new SysConfigOptionDefinition(sysConfigOptionDefinition);
    }

}
