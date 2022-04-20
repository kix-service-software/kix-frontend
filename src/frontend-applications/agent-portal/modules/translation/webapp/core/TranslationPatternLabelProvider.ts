/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LabelProvider } from '../../../../modules/base-components/webapp/core/LabelProvider';
import { TranslationPattern } from '../../model/TranslationPattern';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { TranslationPatternProperty } from '../../model/TranslationPatternProperty';
import { TranslationService } from './TranslationService';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { KIXObject } from '../../../../model/kix/KIXObject';

export class TranslationPatternLabelProvider extends LabelProvider<TranslationPattern> {

    public kixObjectType: KIXObjectType = KIXObjectType.TRANSLATION_PATTERN;

    public isLabelProviderFor(object: KIXObject): boolean {
        return object instanceof TranslationPattern || object?.KIXObjectType === this.kixObjectType;
    }

    public isLabelProviderForType(objectType: KIXObjectType): boolean {
        return objectType === this.kixObjectType;
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue: string;

        switch (property) {
            case TranslationPatternProperty.VALUE:
                displayValue = 'Translatable#Pattern';
                break;
            case TranslationPatternProperty.LANGUAGES:
            case TranslationPatternProperty.AVAILABLE_LANGUAGES:
                displayValue = 'Translatable#Languages';
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

    public async getDisplayText(
        translation: TranslationPattern, property: string, value?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue: string;

        switch (property) {
            case TranslationPatternProperty.VALUE:
                displayValue = translation.Value;
                break;
            case TranslationPatternProperty.AVAILABLE_LANGUAGES:
                displayValue = translation.AvailableLanguages.map((l) => l).join(', ');
                break;
            default:
                displayValue = await super.getDisplayText(translation, property, value, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue;
    }

    public async getObjectText(
        translation: TranslationPattern, id?: boolean, title?: boolean, translatable: boolean = true
    ): Promise<string> {
        return translation.Value;
    }

    public getObjectAdditionalText(translation: TranslationPattern): string {
        return translation.Value;
    }

    public getObjectIcon(translation?: TranslationPattern): string | ObjectIcon {
        return translation ? new ObjectIcon(null, 'Translation', translation.ObjectId) : null;
    }

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = plural ? 'Translations' : 'Translation';
        if (translatable) {
            displayValue = await TranslationService.translate(displayValue);
        }
        return displayValue;
    }

    public async getObjectTooltip(translation: TranslationPattern, translatable: boolean = false): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(
                translation.ObjectId.toString()
            );
        }
        return translation.ObjectId.toString();
    }

    public async getIcons(
        translation: TranslationPattern, property: string, value?: string | number
    ): Promise<Array<string | ObjectIcon>> {
        if (property === 'ICON') {
            return [new ObjectIcon(null, 'Translation', translation.ObjectId)];
        }
        return null;
    }

}
