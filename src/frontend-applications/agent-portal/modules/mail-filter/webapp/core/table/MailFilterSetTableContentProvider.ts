/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableContentProvider } from '../../../../base-components/webapp/core/table/TableContentProvider';
import { MailFilterSet } from '../../../model/MailFilterSet';
import { Table, RowObject, TableValue } from '../../../../base-components/webapp/core/table';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { MailFilter } from '../../../model/MailFilter';
import { SortUtil } from '../../../../../model/SortUtil';
import { DataType } from '../../../../../model/DataType';

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
                            if (s.hasOwnProperty(property)) {
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
