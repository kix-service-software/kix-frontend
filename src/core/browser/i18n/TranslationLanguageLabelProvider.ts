/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TranslationLanguage, KIXObjectType, ObjectIcon, TranslationLanguageProperty } from "../../model";
import { TranslationService } from "./TranslationService";
import { LabelProvider } from "../LabelProvider";

export class TranslationLanguageLabelProvider extends LabelProvider<TranslationLanguage> {

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

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue;
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

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue;
    }

    public async getObjectText(language: TranslationLanguage, id?: boolean, title?: boolean): Promise<string> {
        return await TranslationService.translate('Translatable#TranslationLanguage');
    }

    public getObjectIcon(language?: TranslationLanguage): string | ObjectIcon {
        return language ? new ObjectIcon('TranslationLanguage', language.ObjectId) : null;
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
