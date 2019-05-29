import { KIXObjectFormService } from "../kix/KIXObjectFormService";
import { KIXObjectType } from "../../model";
import { FAQCategory } from "../../model/kix/faq";

export class FAQCategoryFormService extends KIXObjectFormService<FAQCategory> {

    private static INSTANCE: FAQCategoryFormService;

    public static getInstance(): FAQCategoryFormService {
        if (!FAQCategoryFormService.INSTANCE) {
            FAQCategoryFormService.INSTANCE = new FAQCategoryFormService();
        }
        return FAQCategoryFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.FAQ_CATEGORY;
    }

}
