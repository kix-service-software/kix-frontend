/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFormService } from '../../../../../modules/base-components/webapp/core/KIXObjectFormService';
import { TranslationPattern } from '../../../model/TranslationPattern';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { FormConfiguration } from '../../../../../model/configuration/FormConfiguration';
import { TranslationService } from '../TranslationService';
import { SortUtil } from '../../../../../model/SortUtil';
import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';
import { TranslationPatternProperty } from '../../../model/TranslationPatternProperty';

export class TranslationFormService extends KIXObjectFormService {

    private static INSTANCE: TranslationFormService = null;

    public static getInstance(): TranslationFormService {
        if (!TranslationFormService.INSTANCE) {
            TranslationFormService.INSTANCE = new TranslationFormService();
        }

        return TranslationFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.TRANSLATION_PATTERN;
    }

    protected async prePrepareForm(form: FormConfiguration): Promise<void> {
        if (form.pages.length) {
            const languages = await TranslationService.getInstance().getLanguages();
            [...languages].sort((a, b) => SortUtil.compareString(a[1], b[1])).forEach((l) => {
                const languageField = new FormFieldConfiguration(
                    'pattern-field',
                    l[1], l[0], 'text-area-input', false,
                    'Translatable#Helptext_i18n_TranslationPatternCreateEdit_Translation'
                );
                languageField.placeholder = 'Translatable#Translation';
                form.pages[0].groups[0].formFields.push(languageField);
            });
        }
    }

    protected async getValue(property: string, value: string, translation: TranslationPattern): Promise<string> {
        if (translation && property !== TranslationPatternProperty.VALUE && translation.Languages) {
            const language = translation.Languages.find((l) => l.Language === property);
            if (language) {
                value = language.Value;
            }
        }
        return value;
    }
}
