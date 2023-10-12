/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableContentProvider } from '../../../../table/webapp/core/TableContentProvider';
import { MailFilterSet } from '../../../model/MailFilterSet';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { MailFilter } from '../../../model/MailFilter';
import { SortUtil } from '../../../../../model/SortUtil';
import { DataType } from '../../../../../model/DataType';
import { RowObject } from '../../../../table/model/RowObject';
import { Table } from '../../../../table/model/Table';
import { TableValue } from '../../../../table/model/TableValue';

export class MailFilterSetTableContentProvider extends TableContentProvider<MailFilterSet> {

    public constructor(
        table: Table,
        objectIds: Array<string | number>,
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.MAIL_FILTER_SET, table, objectIds, loadingOptions, contextId);
    }

    public async loadData(): Promise<Array<RowObject<MailFilterSet>>> {
        let rowObjects = [];
        if (this.contextId) {
            const context = ContextService.getInstance().getActiveContext();
            const mailFilter = await context.getObject<MailFilter>();
            if (mailFilter && Array.isArray(mailFilter.Set)) {
                rowObjects = SortUtil.sortObjects(mailFilter.Set, 'Key', DataType.STRING)
                    .map((s, i) => {
                        const values: TableValue[] = [];

                        for (const property in s) {
                            if (Object.prototype.hasOwnProperty.call(s, property)) {
                                values.push(new TableValue(property, s[property], s[property]));
                            }
                        }
                        return new RowObject<MailFilterSet>(values, s);
                    });
            }
        }

        return rowObjects;
    }

    protected getContextObjectType(): KIXObjectType | string {
        return KIXObjectType.MAIL_FILTER;
    }

}
