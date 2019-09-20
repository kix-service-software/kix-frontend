/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ITable, IRowObject, RowObject, TableValue } from "../../table";
import {
    KIXObjectType, KIXObjectLoadingOptions, GeneralCatalogItem, FilterCriteria, FilterDataType, FilterType
} from "../../../model";
import { TableContentProvider } from "../../table/TableContentProvider";
import { GeneralCatalogItemProperty } from "../../../model/kix/general-catalog/GeneralCatalogItemProperty";
import { KIXObjectService, SearchOperator } from "../..";

export class GeneralCatalogTableContentProvider extends TableContentProvider<GeneralCatalogItem> {

    public constructor(
        table: ITable,
        objectIds: Array<string | number>,
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.GENERAL_CATALOG_ITEM, table, objectIds, loadingOptions, contextId);
    }

    public async loadData(): Promise<Array<IRowObject<GeneralCatalogItem>>> {

        let loadingOptions;
        const definitionFilter = [
            new FilterCriteria(
                GeneralCatalogItemProperty.CLASS, SearchOperator.NOT_EQUALS,
                FilterDataType.STRING, FilterType.AND, "ITSM::ConfigItem::Class"
            ),
        ];
        loadingOptions = new KIXObjectLoadingOptions(definitionFilter);

        const sysConfigOptions = await KIXObjectService.loadObjects<GeneralCatalogItem>(
            KIXObjectType.GENERAL_CATALOG_ITEM, null, this.loadingOptions ? this.loadingOptions : loadingOptions
        );

        const rowObjects = [];
        sysConfigOptions.forEach((fc) => {
            rowObjects.push(this.createRowObject(fc));
        });

        return rowObjects;
    }

    private createRowObject(definition: GeneralCatalogItem): RowObject {
        const values: TableValue[] = [];

        for (const property in definition) {
            if (definition.hasOwnProperty(property)) {
                if (property === GeneralCatalogItemProperty.NAME) {
                    values.push(new TableValue(property, definition[property], definition[property]));
                } else {
                    values.push(new TableValue(property, definition[property]));
                }
            }
        }

        const rowObject = new RowObject<GeneralCatalogItem>(values, definition);

        return rowObject;
    }
}
