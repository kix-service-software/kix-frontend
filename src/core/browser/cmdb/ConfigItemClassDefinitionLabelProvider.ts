import { ILabelProvider } from "..";
import {
    ObjectIcon, KIXObjectType, ConfigItemClassDefinition, KIXObject, ConfigItemClassProperty, DateTimeUtil,
    ConfigItemClassDefinitionProperty
} from "../../model";
import { TranslationService } from "../i18n/TranslationService";
import { ObjectDataService } from "../ObjectDataService";

export class ConfigItemClassDefinitionLabelProvider implements ILabelProvider<ConfigItemClassDefinition> {

    public kixObjectType: KIXObjectType = KIXObjectType.CONFIG_ITEM_CLASS_DEFINITION;

    public async getPropertyValueDisplayText(property: string, value: string | number | any = ''): Promise<string> {
        return value;
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case ConfigItemClassDefinitionProperty.VERSION:
                displayValue = 'Translatable#Version';
                break;
            case ConfigItemClassProperty.CHANGE_BY:
                displayValue = 'Translatable#Changed by';
                break;
            case ConfigItemClassProperty.CREATE_TIME:
                displayValue = 'Translatable#Created at';
                break;
            case ConfigItemClassProperty.CREATE_BY:
                displayValue = 'Translatable#Created by';
                break;
            default:
                displayValue = property;
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue;
    }

    public async getPropertyIcon(property: string): Promise<string | ObjectIcon> {
        return;
    }

    public async getDisplayText(
        ciClassDefinition: ConfigItemClassDefinition, property: string, value?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = ciClassDefinition[property];

        const objectData = ObjectDataService.getInstance().getObjectData();

        switch (property) {
            case ConfigItemClassDefinitionProperty.CREATE_TIME:
                displayValue = DateTimeUtil.getLocalDateTimeString(displayValue);
                break;
            case ConfigItemClassDefinitionProperty.CREATE_BY:
                const user = objectData.users.find((u) => u.UserID === displayValue);
                if (user) {
                    displayValue = user.UserFullname;
                }
                break;
            default:
                displayValue = ciClassDefinition[property];
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue;
    }

    public getDisplayTextClasses(ciClassDefinition: ConfigItemClassDefinition, property: string): string[] {
        return [];
    }

    public getObjectClasses(ciClassDefinition: ConfigItemClassDefinition): string[] {
        return [];
    }

    public isLabelProviderFor(ciClassDefinition: ConfigItemClassDefinition): boolean {
        return ciClassDefinition instanceof ConfigItemClassDefinition;
    }

    public async getObjectText(
        ciClassDefinition: ConfigItemClassDefinition, id: boolean = true, name: boolean = true
    ): Promise<string> {
        return ciClassDefinition.Class;
    }

    public getObjectAdditionalText(ciClassDefinition: ConfigItemClassDefinition): string {
        return null;
    }

    public getObjectIcon(ciClassDefinition: ConfigItemClassDefinition): string | ObjectIcon {
        return 'kix-icon-ci';
    }

    public getObjectTooltip(ciClassDefinition: ConfigItemClassDefinition): string {
        return ciClassDefinition.Class;
    }

    public async getObjectName(plural: boolean = false, translatable: boolean = true): Promise<string> {
        if (plural) {
            const definitionsLabel = translatable
                ? await TranslationService.translate('Translatable#CI Class Definitions')
                : 'CI Class Definitions';
            return definitionsLabel;
        }

        const definitionLabel = translatable
            ? await TranslationService.translate('Translatable#CI Class Definition')
            : 'CI Class Definition';
        return definitionLabel;
    }

    public async getIcons(
        ciClassDefinition: ConfigItemClassDefinition, property: string, value?: string | number
    ): Promise<Array<string | ObjectIcon>> {
        return [];
    }
}
