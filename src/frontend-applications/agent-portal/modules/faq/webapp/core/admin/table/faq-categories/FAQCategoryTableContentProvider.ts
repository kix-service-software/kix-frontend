/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableContentProvider } from "../../../../../../base-components/webapp/core/table/TableContentProvider";
import { FAQCategory } from "../../../../../model/FAQCategory";
import { ITable, IRowObject, RowObject, TableValue } from "../../../../../../base-components/webapp/core/table";
import { KIXObjectLoadingOptions } from "../../../../../../../model/KIXObjectLoadingOptions";
import { KIXObjectType } from "../../../../../../../model/kix/KIXObjectType";
import { KIXObjectService } from "../../../../../../../modules/base-components/webapp/core/KIXObjectService";

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

        const faqCategories = await KIXObjectService.loadObjects<FAQCategory>(
            KIXObjectType.FAQ_CATEGORY, null, this.loadingOptions
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
