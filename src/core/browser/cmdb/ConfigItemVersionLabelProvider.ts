import { ILabelProvider } from '..';
import { Version, DateTimeUtil, ObjectIcon, KIXObjectType, VersionProperty, User } from '../../model';
import { TranslationService } from '../i18n/TranslationService';
import { KIXObjectService } from '../kix';

export class ConfigItemVersionLabelProvider implements ILabelProvider<Version> {

    public kixObjectType: KIXObjectType = KIXObjectType.CONFIG_ITEM_VERSION;

    public async getPropertyValueDisplayText(
        property: string, value: string | number, translatable: boolean = true
    ): Promise<string> {
        let displayValue = value;

        switch (property) {
            case VersionProperty.CREATE_BY:
                const users = await KIXObjectService.loadObjects<User>(
                    KIXObjectType.USER, [value], null, null, true, true
                ).catch((error) => [] as User[]);
                displayValue = users && !!users.length ? users[0].UserFullname : value;
                break;
            case VersionProperty.CURRENT:
                displayValue = value ? 'Translatable#(Current version)' : '';
                break;
            default:
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue.toString();
    }

    public async getPropertyText(property: string, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case VersionProperty.COUNT_NUMBER:
                displayValue = 'Translatable#No.';
                break;
            case VersionProperty.CREATE_BY:
                displayValue = 'Translatable#Created by';
                break;
            case VersionProperty.CREATE_TIME:
                displayValue = 'Translatable#Created at';
                break;
            case VersionProperty.CURRENT:
                displayValue = 'Translatable#Current version';
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
        version: Version, property: string, value?: string | number, translatable: boolean = true
    ): Promise<string> {
        let displayValue = version[property];

        switch (property) {
            case VersionProperty.CREATE_TIME:
                displayValue = await DateTimeUtil.getLocalDateTimeString(displayValue);
                break;
            case VersionProperty.CURRENT:
                displayValue = version.isCurrentVersion ? 'Translatable#(current version)' : '';
                break;
            default:
                displayValue = await this.getPropertyValueDisplayText(
                    property, displayValue ? displayValue : value
                );
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

    public async getObjectName(): Promise<string> {
        return 'Config Item Version';
    }

    public async getIcons(object: Version, property: string): Promise<Array<string | ObjectIcon>> {
        return null;
    }

}
