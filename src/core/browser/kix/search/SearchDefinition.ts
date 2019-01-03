import { SearchOperator } from "../../SearchOperator";
import {
    KIXObjectType, InputFieldTypes, KIXObjectLoadingOptions,
    FilterCriteria, FilterDataType, FilterType, TreeNode, KIXObject, DataType
} from "../../../model";
import { SearchResultCategory } from "./SearchResultCategory";
import { TableColumn } from "../../standard-table";
import { LabelService } from "../../LabelService";

export abstract class SearchDefinition {

    public constructor(public objectType: KIXObjectType) { }

    public abstract getProperties(parameter?: Array<[string, any]>): Promise<Array<[string, string]>>;

    public abstract getOperations(property: string, parameter?: Array<[string, any]>): Promise<SearchOperator[]>;

    public abstract getInputFieldType(
        property: string, parameter?: Array<[string, any]>
    ): Promise<InputFieldTypes>;

    public abstract getInputComponents(): Promise<Map<string, string>>;

    public abstract getSearchResultCategories(): Promise<SearchResultCategory>;

    public async searchValues(
        property: string, parameter: Array<[string, any]>, searchValue: string, limit: number
    ): Promise<TreeNode[]> {
        return [];
    }

    public async getTreeNodes(property: string, parameter: Array<[string, any]>): Promise<TreeNode[]> {
        return [];
    }

    public getLoadingOptions(criteria: FilterCriteria[]): KIXObjectLoadingOptions {
        return new KIXObjectLoadingOptions(null, criteria);
    }

    public async prepareFormFilterCriteria(criteria: FilterCriteria[]): Promise<FilterCriteria[]> {
        return criteria.filter((c) => c.value !== null && c.value !== undefined && c.value !== '');
    }

    public prepareSearchFormValue(property: string, value: any): FilterCriteria[] {
        return [new FilterCriteria(property, SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, value)];
    }

    public async getTableColumnConfiguration(searchParameter: Array<[string, any]>): Promise<TableColumn[]> {
        const columns = [];
        for (const p of searchParameter) {
            let text = p[1];
            if (!text) {
                const labelProvider = LabelService.getInstance().getLabelProviderForType(this.objectType);
                if (labelProvider) {
                    text = await labelProvider.getPropertyText(p[0]);
                }
            }

            columns.push(new TableColumn(
                p[0], DataType.STRING, text, null, true, true, 100, true, false, true, true, null)
            );
        }
        return columns;
    }
}
