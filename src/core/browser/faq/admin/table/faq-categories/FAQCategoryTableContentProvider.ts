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
        const loadingOptions = new KIXObjectLoadingOptions(null, categoryFilter, null, null,
            [FAQCategoryProperty.SUB_CATEGORIES], [FAQCategoryProperty.SUB_CATEGORIES]
        );

        const faqCategories = await KIXObjectService.loadObjects<FAQCategory>(
            KIXObjectType.FAQ_CATEGORY, null, loadingOptions
        );

        const rowObjects = [];
        faqCategories.forEach((fc) => {
            rowObjects.push(this.createRowObject(fc));
        });

        return rowObjects;
    }

    private createRowObject(category: FAQCategory): RowObject {
        const values: TableValue[] = [];

        for (const property in category) {
            if (category.hasOwnProperty(property)) {
                values.push(new TableValue(property, category[property]));
            }
        }

        const rowObject = new RowObject<FAQCategory>(values, category);

        if (category.SubCategories && Array.isArray(category.SubCategories) && category.SubCategories.length) {
            category.SubCategories.forEach((sc) => {
                rowObject.addChild(this.createRowObject(sc));
            });
        }

        return rowObject;
    }

}
