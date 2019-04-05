import { ILabelProvider } from "../ILabelProvider";
import { Translation, KIXObjectType, ObjectIcon, TranslationProperty, DateTimeUtil, User } from "../../model";
import { TranslationService } from "./TranslationService";
import { KIXObjectService } from "../kix";

export class TranslationLabelProvider implements ILabelProvider<Translation> {

    public kixObjectType: KIXObjectType = KIXObjectType.TRANSLATION;

    public isLabelProviderFor(translation: Translation): boolean {
        return translation instanceof Translation;
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = property;

        switch (property) {
            case TranslationProperty.PATTERN:
                displayValue = 'Translatable#Pattern';
                break;
            case TranslationProperty.LANGUAGES:
                displayValue = 'Translatable#Languages';
                break;
            case TranslationProperty.CREATE_BY:
                displayValue = 'Translatable#Created by';
                break;
            case TranslationProperty.CREATE_TIME:
                displayValue = 'Translatable#Created at';
                break;
            case TranslationProperty.CHANGE_BY:
                displayValue = 'Translatable#Changed by';
                break;
            case TranslationProperty.CHANGE_TIME:
                displayValue = 'Translatable#Changed at';
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
        translation: Translation, property: string, value?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = translation[property];

        switch (property) {
            case TranslationProperty.PATTERN:
                displayValue = translation.Pattern;
                break;
            case TranslationProperty.LANGUAGES:
                displayValue = translation.Languages.map((l) => l.Language).join(', ');
                break;
            case TranslationProperty.CREATE_BY:
            case TranslationProperty.CHANGE_BY:
                const users = await KIXObjectService.loadObjects<User>(
                    KIXObjectType.USER, [value], null, null, true
                ).catch((error) => [] as User[]);
                displayValue = users && !!users.length ? users[0].UserFullname : value;
                break;
            case TranslationProperty.CREATE_TIME:
            case TranslationProperty.CHANGE_TIME:
                displayValue = await DateTimeUtil.getLocalDateTimeString(displayValue);
                break;
            default:
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue;
    }

    public async getPropertyValueDisplayText(property: string, value: string | number): Promise<string> {
        return value.toString();
    }

    public getDisplayTextClasses(translation: Translation, property: string): string[] {
        return [];
    }

    public getObjectClasses(translation: Translation): string[] {
        return [];
    }

    public async getObjectText(
        translation: Translation, id?: boolean, title?: boolean, translatable: boolean = true
    ): Promise<string> {
        let displayValue = 'Translatable#Translation';
        if (translatable) {
            displayValue = await TranslationService.translate(displayValue);
        }
        return `${displayValue}: ${translation.Pattern}`;
    }

    public getObjectAdditionalText(translation: Translation): string {
        return translation.Pattern;
    }

    public getObjectIcon(translation?: Translation): string | ObjectIcon {
        return new ObjectIcon('Translation', translation.ObjectId);
    }

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = plural ? 'Translations' : 'Translation';
        if (translatable) {
            displayValue = await TranslationService.translate(displayValue);
        }
        return displayValue;
    }

    public getObjectTooltip(translation: Translation): string {
        return translation.ObjectId.toString();
    }

    public async getIcons(
        translation: Translation, property: string, value?: string | number
    ): Promise<Array<string | ObjectIcon>> {
        if (property === 'ICON') {
            return [new ObjectIcon('Translation', translation.ObjectId)];
        }
        return null;
    }

}
