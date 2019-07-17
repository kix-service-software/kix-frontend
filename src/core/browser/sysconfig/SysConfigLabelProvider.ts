import { ObjectIcon, KIXObjectType, SysConfigOptionDefinitionProperty } from '../../model';
import { TranslationService } from '../i18n/TranslationService';
import { SysConfigOptionDefinition } from '../../model/kix/sysconfig/SysConfigOptionDefinition';
import { LabelProvider } from '../LabelProvider';

export class SysConfigLabelProvider extends LabelProvider<SysConfigOptionDefinition> {

    public kixObjectType: KIXObjectType = KIXObjectType.SYS_CONFIG_OPTION_DEFINITION;

    public isLabelProviderForType(objectType: KIXObjectType): boolean {
        return objectType === this.kixObjectType;
    }

    public async getPropertyValueDisplayText(
        property: string, value: string | number, translatable: boolean = true
    ): Promise<string> {
        let displayValue = value;
        switch (property) {
            case SysConfigOptionDefinitionProperty.IS_MODIFIED:
                displayValue = value === 1 ? 'Translatable#Modified' : '';
                break;
            case SysConfigOptionDefinitionProperty.VALUE:
                displayValue = JSON.stringify(value);
                break;
            default:
                displayValue = await super.getPropertyValueDisplayText(property, value, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue ? displayValue.toString() : '';
    }

    public isLabelProviderFor(object: SysConfigOptionDefinition): boolean {
        return object instanceof SysConfigOptionDefinition;
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case SysConfigOptionDefinitionProperty.NAME:
                displayValue = 'Translatable#Name';
                break;
            case SysConfigOptionDefinitionProperty.VALUE:
                displayValue = 'Translatable#Value';
                break;
            case SysConfigOptionDefinitionProperty.IS_MODIFIED:
                displayValue = 'Translatable#Modified';
                break;
            default:
                displayValue = await super.getPropertyText(property, short, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue;
    }

    public async getPropertyIcon(property: string): Promise<string | ObjectIcon> {
        return;
    }

    public async getDisplayText(
        sysConfig: SysConfigOptionDefinition, property: string, value?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = sysConfig[property];
        switch (property) {
            case SysConfigOptionDefinitionProperty.NAME:
                displayValue = sysConfig.Name;
                break;
            case SysConfigOptionDefinitionProperty.VALUE:
                displayValue = sysConfig.IsModified === 1
                    ? sysConfig.Value : sysConfig.Default;
                displayValue = sysConfig.Type === "Hash"
                    ? JSON.stringify(displayValue) : displayValue;
                break;
            default:
                displayValue = await this.getPropertyValueDisplayText(property, displayValue, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue;
    }

    public getDisplayTextClasses(object: SysConfigOptionDefinition, property: string): string[] {
        return [];
    }

    public getObjectClasses(object: SysConfigOptionDefinition): string[] {
        return [];
    }

    public async getObjectText(
        sysConfig: SysConfigOptionDefinition, id?: boolean, title?: boolean, translatable?: boolean
    ): Promise<string> {
        return `${sysConfig.Name} (${sysConfig.ObjectId})`;
    }

    public getObjectAdditionalText(object: SysConfigOptionDefinition, translatable: boolean = true): string {
        return '';
    }

    public getObjectIcon(object: SysConfigOptionDefinition): string | ObjectIcon {
        return new ObjectIcon('SysConfig', object.Name);
    }

    public getObjectTooltip(object: SysConfigOptionDefinition): string {
        return '';
    }

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(
                plural ? 'Translatable#' : 'Translatable#'
            );
        }
        return plural ? '' : '';
    }


    public async getIcons(object: SysConfigOptionDefinition, property: string): Promise<Array<string | ObjectIcon>> {
        const icons = [];
        return icons;
    }

}

