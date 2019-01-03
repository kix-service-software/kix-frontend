import { KIXObjectService, ServiceRegistry } from "../kix";
import { KIXObjectType, ContextDescriptor, ContextType, ContextMode } from "../../model";
import { SearchContext } from "./context";
import { ContextService } from "../context";
import { ActionFactory } from "../ActionFactory";
import { CSVExportAction, BulkAction } from "../actions";
import { SearchResultPrintAction } from "./actions/SearchResultPrintAction";

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

    protected prepareCreateValue(property: string, value: any): Promise<Array<[string, any]>> {
        throw new Error("Method not implemented.");
    }

}
