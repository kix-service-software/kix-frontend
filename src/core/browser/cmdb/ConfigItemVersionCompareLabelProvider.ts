import { ILabelProvider } from '..';
import { Version, ObjectIcon, KIXObjectType, VersionProperty } from '../../model';
import { ContextService } from '../context';
import { TranslationService } from '../i18n/TranslationService';

export class ConfigItemVersionCompareLabelProvider implements ILabelProvider<Version> {

    public kixObjectType: KIXObjectType = KIXObjectType.CONFIG_ITEM_VERSION_COMPARE;

    public async getPropertyValueDisplayText(
        property: string, value: string | number, translatable: boolean = true
    ): Promise<string> {
        let displayValue = value ? value.toString() : '';
        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }
        return displayValue;
    }

    public async getPropertyText(property: string, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case 'CONFIG_ITEM_ATTRIBUTE':
                displayValue = 'Translatable#Attributes';
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
        version: Version, property: string, value?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = property.toString();

        switch (property) {
            case 'CONFIG_ITEM_ATTRIBUTE':
                displayValue = displayValue;
                break;
            default:
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue;
    }

    public getDisplayTextClasses(object: Version, property: string): string[] {
        return [];
    }

    public getObjectClasses(object: Version): string[] {
        return [];
    }

    public isLabelProviderFor(object: Version): boolean {
        return object instanceof Version;
    }

    public async getObjectText(object: Version): Promise<string> {
        throw new Error('Method not implemented.');
    }

    public getObjectAdditionalText(object: Version): string {
        throw new Error('Method not implemented.');
    }

    public getObjectIcon(object: Version): string | ObjectIcon {
        throw new Error('Method not implemented.');
    }

    public getObjectTooltip(object: Version): string {
        throw new Error('Method not implemented.');
    }

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = 'Translatable#Config Item Version Compare';
        if (translatable) {
            displayValue = await TranslationService.translate(displayValue, []);
        }
        return displayValue;
    }

    public async getIcons(object: Version, property: string): Promise<Array<string | ObjectIcon>> {
        return null;
    }

}
