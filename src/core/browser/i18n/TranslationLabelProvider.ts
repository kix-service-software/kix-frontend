import { ILabelProvider } from "../ILabelProvider";
import { Translation, KIXObjectType, ObjectIcon, TranslationProperty, } from "../../model";

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
            default:
                displayValue = property;
        }
        return displayValue;
    }

    public getDisplayText(translation: Translation, property: string): Promise<string> {
        let displayValue = translation[property];

        switch (property) {
            case TranslationProperty.PATTERN:
                displayValue = translation.Pattern;
                break;
            case TranslationProperty.LANGUAGES:
                displayValue = translation.Languages.map((l) => l.Language).join(', ');
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
        return 'Translation';
    }

    public getObjectAdditionalText(translation: Translation): string {
        return null;
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
