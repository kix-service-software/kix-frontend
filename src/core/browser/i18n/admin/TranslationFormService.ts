import { Translation, KIXObjectType, TranslationProperty } from "../../../model";
import { KIXObjectFormService } from "../../kix/KIXObjectFormService";

export class TranslationFormService extends KIXObjectFormService<Translation> {

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
        return kixObjectType === KIXObjectType.TRANSLATION;
    }

    protected async getValue(property: string, value: any, translation: Translation): Promise<any> {
        if (property !== TranslationProperty.PATTERN && translation.Languages) {
            const language = translation.Languages.find((l) => l.Language === property);
            if (language) {
                value = language.Value;
            }
        }
        return value;
    }
}
