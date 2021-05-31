/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableContentProvider } from '../../../../../../base-components/webapp/core/table/TableContentProvider';
import { TranslationLanguage } from '../../../../../model/TranslationLanguage';
import { Table, RowObject, TableValue } from '../../../../../../base-components/webapp/core/table';
import { KIXObjectLoadingOptions } from '../../../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectType } from '../../../../../../../model/kix/KIXObjectType';
import { ContextService } from '../../../../../../../modules/base-components/webapp/core/ContextService';
import { TranslationPattern } from '../../../../../model/TranslationPattern';
import { SortUtil } from '../../../../../../../model/SortUtil';
import { TranslationLanguageProperty } from '../../../../../model/TranslationLanguageProperty';
import { DataType } from '../../../../../../../model/DataType';
import { SortOrder } from '../../../../../../../model/SortOrder';

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
