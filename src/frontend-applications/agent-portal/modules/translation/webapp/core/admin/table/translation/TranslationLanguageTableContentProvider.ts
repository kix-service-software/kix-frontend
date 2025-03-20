/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableContentProvider } from '../../../../../../table/webapp/core/TableContentProvider';
import { TranslationLanguage } from '../../../../../model/TranslationLanguage';
import { KIXObjectLoadingOptions } from '../../../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectType } from '../../../../../../../model/kix/KIXObjectType';
import { ContextService } from '../../../../../../../modules/base-components/webapp/core/ContextService';
import { TranslationPattern } from '../../../../../model/TranslationPattern';
import { SortUtil } from '../../../../../../../model/SortUtil';
import { TranslationLanguageProperty } from '../../../../../model/TranslationLanguageProperty';
import { DataType } from '../../../../../../../model/DataType';
import { SortOrder } from '../../../../../../../model/SortOrder';
import { RowObject } from '../../../../../../table/model/RowObject';
import { Table } from '../../../../../../table/model/Table';
import { TableValue } from '../../../../../../table/model/TableValue';

export class TranslationLanguageTableContentProvider extends TableContentProvider<TranslationLanguage> {

    public constructor(
        table: Table,
        objectIds: Array<string | number>,
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.TRANSLATION_LANGUAGE, table, objectIds, loadingOptions, contextId);
    }

    public async loadData(): Promise<Array<RowObject<TranslationLanguage>>> {
        const rowObjects = [];
        if (this.contextId) {
            const context = ContextService.getInstance().getActiveContext();
            const translation = await context.getObject<TranslationPattern>();
            if (translation && translation.Languages && !!translation.Languages.length) {
                const languages = SortUtil.sortObjects(
                    translation.Languages, TranslationLanguageProperty.LANGUAGE,
                    DataType.STRING, SortOrder.DOWN
                );

                for (const l of languages) {
                    const values: TableValue[] = [];

                    const columns = this.table.getColumns().map((c) => c.getColumnConfiguration());
                    for (const column of columns) {
                        const tableValue = new TableValue(column.property, l[column.property]);
                        values.push(tableValue);
                    }

                    rowObjects.push(new RowObject<TranslationLanguage>(values, l));
                }
            }
        }

        return rowObjects;
    }

    protected getContextObjectType(): KIXObjectType | string {
        return KIXObjectType.TRANSLATION_PATTERN;
    }

}
