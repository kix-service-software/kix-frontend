import { KIXObjectService } from "../kix";
import { KIXObjectType, GeneralCatalogItem } from "../../model";

export class GeneralCatalogService extends KIXObjectService<GeneralCatalogItem> {

    private static INSTANCE: GeneralCatalogService;

    public static getInstance(): GeneralCatalogService {
        if (!GeneralCatalogService.INSTANCE) {
            GeneralCatalogService.INSTANCE = new GeneralCatalogService();
        }
        return GeneralCatalogService.INSTANCE;
    }

    public isServiceFor(type: KIXObjectType) {
        return type === KIXObjectType.GENERAL_CATALOG_ITEM;
    }

    public getLinkObjectName(): string {
        return "GeneralCatalogItem";
    }
}
