import { KIXObjectService } from "../kix";
import { KIXObjectType } from "../../model";

export class SearchService extends KIXObjectService<any> {

    private static INSTANCE: SearchService;

    public static getInstance(): SearchService {
        if (!SearchService.INSTANCE) {
            SearchService.INSTANCE = new SearchService();
        }
        return SearchService.INSTANCE;
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return false;
    }

    public getLinkObjectName(): string {
        return null;
    }
}
