import { ILabelProvider } from "../ILabelProvider";
import { Translation, KIXObjectType, ObjectIcon, TranslationProperty, DateTimeUtil, } from "../../model";
import { ContextService } from "../context";

export class TranslationLabelProvider implements ILabelProvider<Translation> {

    public kixObjectType: KIXObjectType = KIXObjectType.TRANSLATION;

    public isLabelProviderFor(translation: Translation): boolean {
        return translation instanceof Translation;
    }

    public async getPropertyText(property: string, translation?: Translation, short?: boolean): Promise<string> {
        let displayValue = property;

        switch (property) {
            case TranslationProperty.PATTERN:
                displayValue = 'Basiszeichenkette';
                break;
            case TranslationProperty.LANGUAGES:
                displayValue = 'Sprachen';
                break;
            case TranslationProperty.CREATE_BY:
                displayValue = 'Erstellt von';
                break;
            case TranslationProperty.CREATE_TIME:
                displayValue = 'Erstellt am';
                break;
            case TranslationProperty.CHANGE_BY:
                displayValue = 'Geändert von';
                break;
            case TranslationProperty.CHANGE_TIME:
                displayValue = 'Geändert am';
                break;
            default:
                displayValue = property;
        }
        return displayValue;
    }

    public async getDisplayText(translation: Translation, property: string): Promise<string> {
        let displayValue = translation[property];

        const objectData = ContextService.getInstance().getObjectData();

        switch (property) {
            case TranslationProperty.PATTERN:
                displayValue = translation.Pattern;
                break;
            case TranslationProperty.LANGUAGES:
                displayValue = translation.Languages.map((l) => l.Language).join(', ');
                break;
            case TranslationProperty.CREATE_BY:
            case TranslationProperty.CHANGE_BY:
                const user = objectData.users.find((u) => u.UserID === displayValue);
                if (user) {
                    displayValue = user.UserFullname;
                }
                break;
            case TranslationProperty.CREATE_TIME:
            case TranslationProperty.CHANGE_TIME:
                displayValue = DateTimeUtil.getLocalDateTimeString(displayValue);
                break;
            default:
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

    public async getObjectText(translation: Translation, id?: boolean, title?: boolean): Promise<string> {
        return 'Übersetzung: ' + translation.Pattern;
    }

    public getObjectAdditionalText(translation: Translation): string {
        return translation.Pattern;
    }

    public getObjectIcon(translation?: Translation): string | ObjectIcon {
        return new ObjectIcon('Translation', translation.ObjectId);
    }

    public getObjectName(plural?: boolean): string {
        return plural ? 'Übersetzung' : 'Übersetzungen';
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
