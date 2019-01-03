import { IKIXObjectFactory } from "../kix";
import { GeneralCatalogItem } from "../../api";

export class GeneralCatalogBrowserFactory implements IKIXObjectFactory<GeneralCatalogItem> {

    private static INSTANCE: GeneralCatalogBrowserFactory;

    public static getInstance(): GeneralCatalogBrowserFactory {
        if (!GeneralCatalogBrowserFactory.INSTANCE) {
            GeneralCatalogBrowserFactory.INSTANCE = new GeneralCatalogBrowserFactory();
        }
        return GeneralCatalogBrowserFactory.INSTANCE;
    }

    public async create(item: GeneralCatalogItem): Promise<GeneralCatalogItem> {
        return new GeneralCatalogItem(item);
    }

}
