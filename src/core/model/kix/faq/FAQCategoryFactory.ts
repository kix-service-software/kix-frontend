import { KIXObjectType } from "../KIXObjectType";
import { IObjectFactory } from "../IObjectFactory";
import { FAQCategory } from "./FAQCategory";

export class FAQCategoryFactory implements IObjectFactory<FAQCategory> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.QUEUE;
    }

    public create(category?: FAQCategory): FAQCategory {
        return new FAQCategory(category);
    }

}
