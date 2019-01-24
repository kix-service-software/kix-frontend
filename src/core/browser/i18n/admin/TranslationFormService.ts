import { KIXObjectFormService } from "../../kix/KIXObjectFormService";
import { KIXObjectType, Translation } from "../../../model";

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
}
