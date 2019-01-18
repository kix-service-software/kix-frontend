import { KIXObjectFormService } from "../../kix/KIXObjectFormService";
import { KIXObjectType, ConfigItemClass, FormField, ConfigItemClassProperty } from "../../../model";

export class ConfigItemClassFormService extends KIXObjectFormService<ConfigItemClass> {

    private static INSTANCE: ConfigItemClassFormService = null;

    public static getInstance(): ConfigItemClassFormService {
        if (!ConfigItemClassFormService.INSTANCE) {
            ConfigItemClassFormService.INSTANCE = new ConfigItemClassFormService();
        }

        return ConfigItemClassFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.CONFIG_ITEM_CLASS;
    }

    protected async getValue(property: string, value: any, ciClass: ConfigItemClass): Promise<any> {
        switch (property) {
            case ConfigItemClassProperty.DEFINITION_STRING:
                if (ciClass && ciClass.CurrentDefinition) {
                    value = ciClass.CurrentDefinition.DefinitionString;
                }
                break;
            default:
        }
        return value;
    }
}
