import { TableContentProvider } from "../../../../table/TableContentProvider";
import {
    KIXObjectType, KIXObjectLoadingOptions, FilterCriteria, FilterDataType, FilterType
} from "../../../../../model";
import { ITable, IRowObject, TableValue, RowObject } from "../../../../table";
import { FAQCategory, FAQCategoryProperty } from "../../../../../model/kix/faq";
import { SearchOperator } from "../../../../SearchOperator";
import { KIXObjectService } from "../../../../kix";

export class FAQCategoryTableContentProvider extends TableContentProvider<FAQCategory> {

    public constructor(
        table: ITable,
        objectIds: Array<string | number>,
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.FAQ_CATEGORY, table, objectIds, loadingOptions, contextId);
    }

    public async loadData(): Promise<Array<IRowObject<FAQCategory>>> {

        const categoryFilter = [
            new FilterCriteria(
                FAQCategoryProperty.PARENT_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC, FilterType.AND, null
            )
        ];
        const loadingOptions = new KIXObjectLoadingOptions(null, categoryFilter, null, null, null,
            ['SubCategories'], ['SubCategories']
        );

        const faqCategories = await KIXObjectService.loadObjects<FAQCategory>(
            KIXObjectType.FAQ_CATEGORY, null, loadingOptions
        );

        const rowObjects = [];
        faqCategories.forEach((fc) => {
            rowObjects.push(this.createRow(fc, null));
        });

        return rowObjects;
    }

    private createRow(category: FAQCategory, parent: RowObject): RowObject {
        const values: TableValue[] = [];

        for (const property in category) {
            if (category.hasOwnProperty(property)) {
                values.push(new TableValue(property, category[property]));
            }
        }

        const rowObject = new RowObject<FAQCategory>(values, category);

        if (category.SubCategories) {
            category.SubCategories.forEach((sc) => {
                const row = this.createRow(sc, rowObject);
                if (parent) {
                    parent.addChild(row);
                } else {
                    rowObject.addChild(row);
                }
            });
        }

        return rowObject;
    }

}
