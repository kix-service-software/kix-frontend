/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    TranslationPattern, KIXObjectType, TranslationPatternProperty, Form, KIXObject, FormFieldValue, FormField
} from "../../../model";
import { KIXObjectFormService } from "../../kix/KIXObjectFormService";

export class TranslationFormService extends KIXObjectFormService<TranslationPattern> {

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

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.TRANSLATION_PATTERN;
    }

    protected async getValue(property: string, value: any, translation: TranslationPattern): Promise<any> {
        if (translation && property !== TranslationPatternProperty.VALUE && translation.Languages) {
            const language = translation.Languages.find((l) => l.Language === property);
            if (language) {
                value = language.Value;
            }
        }
        return value;
    }
}
