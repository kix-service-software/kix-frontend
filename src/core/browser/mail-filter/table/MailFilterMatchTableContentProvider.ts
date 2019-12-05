/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableContentProvider } from "../../table/TableContentProvider";
import {
    KIXObjectType, KIXObjectLoadingOptions, MailFilter, MailFilterMatch, SortUtil, DataType
} from "../../../model";
import { ITable, IRowObject, TableValue, RowObject } from "../../table";
import { ContextService } from "../../context";

export class MailFilterMatchTableContentProvider extends TableContentProvider<MailFilterMatch> {

    public constructor(
        table: ITable,
        objectIds: Array<string | number>,
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.MAIL_FILTER_MATCH, table, objectIds, loadingOptions, contextId);
    }

    public async loadData(): Promise<Array<IRowObject<MailFilterMatch>>> {
        let rowObjects = [];
        if (this.contextId) {
            const context = await ContextService.getInstance().getContext(this.contextId);
            const mailFilter = await context.getObject<MailFilter>();
            if (mailFilter && Array.isArray(mailFilter.Match)) {
                rowObjects = SortUtil.sortObjects(mailFilter.Match, 'Key', DataType.STRING)
                    .map((m, i) => {
                        const values: TableValue[] = [];

                        for (const property in m) {
                            if (m.hasOwnProperty(property)) {
                                if (property === 'Not') {
                                    values.push(
                                        new TableValue(
                                            property, m[property], null, undefined,
                                            Boolean(m[property]) ? ['kix-icon-check'] : null
                                        )
                                    );
                                } else {
                                    values.push(new TableValue(property, m[property], m[property]));
                                }
                            }
                        }
                        return new RowObject<MailFilterMatch>(values, m);
                    });
            }
        }

        return rowObjects;
    }

    protected getContextObjectType(): KIXObjectType | string {
        return KIXObjectType.MAIL_FILTER;
    }
}
