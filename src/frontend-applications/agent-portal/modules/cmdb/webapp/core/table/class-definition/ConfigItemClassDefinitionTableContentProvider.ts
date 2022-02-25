/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableContentProvider } from '../../../../../table/webapp/core/TableContentProvider';
import { ConfigItemClassDefinition } from '../../../../model/ConfigItemClassDefinition';
import { KIXObjectLoadingOptions } from '../../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { TranslationService } from '../../../../../../modules/translation/webapp/core/TranslationService';
import { ContextService } from '../../../../../../modules/base-components/webapp/core/ContextService';
import { ConfigItemClass } from '../../../../model/ConfigItemClass';
import { ConfigItemClassDefinitionProperty } from '../../../../model/ConfigItemClassDefinitionProperty';
import { RowObject } from '../../../../../table/model/RowObject';
import { Table } from '../../../../../table/model/Table';
import { TableValue } from '../../../../../table/model/TableValue';

export class ConfigItemClassDefinitionTableContentProvider extends TableContentProvider<ConfigItemClassDefinition> {

    public constructor(
        table: Table,
        objectIds: Array<string | number>,
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        // use class type not definition type for class version updates (objectChanged)
        super(KIXObjectType.CONFIG_ITEM_CLASS, table, objectIds, loadingOptions, contextId);
    }

    public async loadData(): Promise<Array<RowObject<ConfigItemClassDefinition>>> {
        const rowObjects = [];

        const isCurrentText = await TranslationService.translate('Translatable#(Current definition)');

        const context = ContextService.getInstance().getActiveContext();
        const configItemClass = await context.getObject<ConfigItemClass>();
        if (configItemClass && configItemClass.Definitions && !!configItemClass.Definitions.length) {

            for (const d of configItemClass.Definitions) {
                const values: TableValue[] = [];

                const columns = this.table.getColumns().map((c) => c.getColumnConfiguration());
                for (const column of columns) {
                    if (column.property === ConfigItemClassDefinitionProperty.CURRENT) {
                        values.push(
                            new TableValue(
                                ConfigItemClassDefinitionProperty.CURRENT, d.isCurrentDefinition,
                                d.isCurrentDefinition ? isCurrentText : ''
                            )
                        );
                    } else {
                        const tableValue = new TableValue(column.property, d[column.property]);
                        values.push(tableValue);
                    }
                }

                rowObjects.push(new RowObject<ConfigItemClassDefinition>(values, d));
            }
        }

        return rowObjects;
    }

}
