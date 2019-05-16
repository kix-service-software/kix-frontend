import { ObjectFactory } from "./ObjectFactory";
import { FAQCategory } from "../../model/kix/faq";
import { KIXObjectType } from "../../model";

export class FAQCategoryFactory extends ObjectFactory<FAQCategory> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.FAQ_CATEGORY;
    }

    public create(category?: FAQCategory): FAQCategory {
        return new FAQCategory(category);
    }

}
