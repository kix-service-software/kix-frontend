import { SysConfigOptionDefinition } from "./SysConfigOptionDefinition";
import { KIXObjectType } from "../KIXObjectType";
import { ObjectFactory } from "../../../services/object-factories/ObjectFactory";

export class SysConfigOptionDefinitionFactory extends ObjectFactory<SysConfigOptionDefinition> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.SYS_CONFIG_OPTION_DEFINITION;
    }

    public create(sysConfigOptionDefinition?: SysConfigOptionDefinition): SysConfigOptionDefinition {
        return new SysConfigOptionDefinition(sysConfigOptionDefinition);
    }

}
