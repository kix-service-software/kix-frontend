import { ILabelProvider } from "../ILabelProvider";
import { TranslationLanguage, KIXObjectType, ObjectIcon, TranslationLanguageProperty } from "../../model";
import { TranslationService } from "./TranslationService";

export class TranslationLanguageLabelProvider implements ILabelProvider<TranslationLanguage> {

    public kixObjectType: KIXObjectType = KIXObjectType.TRANSLATION_LANGUAGE;

    public isLabelProviderFor(language: TranslationLanguage): boolean {
        return language instanceof TranslationLanguage;
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case TranslationLanguageProperty.LANGUAGE:
                displayValue = 'Translatable#Language';
                break;
            case TranslationLanguageProperty.VALUE:
                displayValue = 'Translatable#Translation';
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
        language: TranslationLanguage, property: string, value?: string, translatable: boolean = true
    ): Promise<string> {
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

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
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

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = plural ? 'Translations' : 'Translation';
        if (translatable) {
            displayValue = await TranslationService.translate(displayValue);
        }
        return displayValue;
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
