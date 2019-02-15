import { ILabelProvider } from "../ILabelProvider";
import { TranslationLanguage, KIXObjectType, ObjectIcon, TranslationLanguageProperty } from "../../model";

export class TranslationLanguageLabelProvider implements ILabelProvider<TranslationLanguage> {

    public kixObjectType: KIXObjectType = KIXObjectType.TRANSLATION_LANGUAGE;

    public isLabelProviderFor(language: TranslationLanguage): boolean {
        return language instanceof TranslationLanguage;
    }

    public async getPropertyText(property: string, short?: boolean): Promise<string> {
        let displayValue = property;
        switch (property) {
            case TranslationLanguageProperty.LANGUAGE:
                displayValue = 'Sprache';
                break;
            case TranslationLanguageProperty.VALUE:
                displayValue = 'Übersetzung';
                break;
            default:
                displayValue = property;
        }
        return displayValue;
    }

    public async getPropertyIcon(property: string): Promise<string | ObjectIcon> {
        return;
    }

    public getDisplayText(language: TranslationLanguage, property: string): Promise<string> {
        let displayValue = language[property];

        switch (property) {
            case TranslationLanguageProperty.LANGUAGE:
                displayValue = language.Language;
                break;
            case TranslationLanguageProperty.VALUE:
                displayValue = language.Value;
                break;
            default:
        }

        return displayValue;
    }

    public async getPropertyValueDisplayText(property: string, value: string | number): Promise<string> {
        return value.toString();
    }

    public getDisplayTextClasses(language: TranslationLanguage, property: string): string[] {
        return [];
    }

    public getObjectClasses(language: TranslationLanguage): string[] {
        return [];
    }

    public async getObjectText(language: TranslationLanguage, id?: boolean, title?: boolean): Promise<string> {
        return 'TranslationLanguage';
    }

    public getObjectAdditionalText(language: TranslationLanguage): string {
        return null;
    }

    public getObjectIcon(language?: TranslationLanguage): string | ObjectIcon {
        return new ObjectIcon('TranslationLanguage', language.ObjectId);
    }

    public getObjectName(plural?: boolean): string {
        return plural ? 'Übersetzung' : 'Übersetzungen';
    }

    public getObjectTooltip(language: TranslationLanguage): string {
        return language.ObjectId.toString();
    }

    public async getIcons(
        language: TranslationLanguage, property: string, value?: string | number
    ): Promise<Array<string | ObjectIcon>> {
        if (property === TranslationLanguageProperty.TRANSLATION_ID) {
            return [new ObjectIcon('TranslationLanguage', language.ObjectId)];
        }
        return null;
    }

}
