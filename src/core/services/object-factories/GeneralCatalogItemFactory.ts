import { ObjectFactory } from "./ObjectFactory";
import { GeneralCatalogItem, KIXObjectType } from "../../model";

export class GeneralCatalogItemFactory extends ObjectFactory<GeneralCatalogItem> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.GENERAL_CATALOG_ITEM;
    }

    public create(gcItem?: GeneralCatalogItem): GeneralCatalogItem {
        return new GeneralCatalogItem(gcItem);
    }


}
