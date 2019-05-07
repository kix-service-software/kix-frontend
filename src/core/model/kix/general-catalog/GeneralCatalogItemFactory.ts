import { IObjectFactory } from "../IObjectFactory";
import { KIXObjectType } from "../KIXObjectType";
import { GeneralCatalogItem } from './GeneralCatalogItem';

export class GeneralCatalogItemFactory implements IObjectFactory<GeneralCatalogItem> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.GENERAL_CATALOG_ITEM;
    }

    public create(gcItem?: GeneralCatalogItem): GeneralCatalogItem {
        return new GeneralCatalogItem(gcItem);
    }


}
