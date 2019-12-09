/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableContentProvider } from "../../../../../../base-components/webapp/core/table/TableContentProvider";
import { TranslationPattern } from "../../../../../model/TranslationPattern";
import { ITable, IRowObject, TableValue, RowObject } from "../../../../../../base-components/webapp/core/table";
import { KIXObjectLoadingOptions } from "../../../../../../../model/KIXObjectLoadingOptions";
import { KIXObjectType } from "../../../../../../../model/kix/KIXObjectType";
import { KIXObjectService } from "../../../../../../../modules/base-components/webapp/core/KIXObjectService";
import { TranslationPatternProperty } from "../../../../../model/TranslationPatternProperty";

export class TranslationPatternTableContentProvider extends TableContentProvider<TranslationPattern> {

    public constructor(
        table: ITable,
        objectIds: Array<string | number>,
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.TRANSLATION_PATTERN, table, objectIds, loadingOptions, contextId);
    }

    public async loadData(): Promise<Array<IRowObject<TranslationPattern>>> {
        let objects = [];
        if (!this.objectIds || (this.objectIds && this.objectIds.length > 0)) {
            objects = await KIXObjectService.loadObjects<TranslationPattern>(
                this.objectType, this.objectIds, this.loadingOptions, null, false
            );
        }

        const rowObjects = objects.map((t) => {
            const values: TableValue[] = [];

            for (const property in t) {
                if (t.hasOwnProperty(property)) {
                    if (property === TranslationPatternProperty.VALUE) {
                        values.push(new TableValue(property, t[property], t[property]));
                    } else {
                        values.push(new TableValue(property, t[property]));
                    }
                }
            }

            return new RowObject<TranslationPattern>(values, t);
        });

        return rowObjects;
    }

}
