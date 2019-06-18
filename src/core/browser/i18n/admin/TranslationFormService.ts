import { TranslationPattern, KIXObjectType, TranslationPatternProperty } from "../../../model";
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
