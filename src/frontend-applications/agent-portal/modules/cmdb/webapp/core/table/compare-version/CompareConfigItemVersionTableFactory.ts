/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableFactory } from '../../../../../base-components/webapp/core/table/TableFactory';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { TableConfiguration } from '../../../../../../model/configuration/TableConfiguration';
import { Table } from '../../../../../base-components/webapp/core/table';
import { CompareConfigItemVersionTableContentProvider } from './CompareConfigItemVersionTableContentProvider';
import { DefaultColumnConfiguration } from '../../../../../../model/configuration/DefaultColumnConfiguration';
import { DataType } from '../../../../../../model/DataType';
import { TableHeaderHeight } from '../../../../../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../../../../../model/configuration/TableRowHeight';
import { IColumnConfiguration } from '../../../../../../model/configuration/IColumnConfiguration';
import { ContextService } from '../../../../../base-components/webapp/core/ContextService';
import { Version } from '../../../../model/Version';

export class CompareConfigItemVersionTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.CONFIG_ITEM_VERSION_COMPARE;

    public async createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: Array<number | string>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean
    ): Promise<Table> {

        tableConfiguration = await this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);

        const table = new Table(tableKey, tableConfiguration);

        const contentProvider = new CompareConfigItemVersionTableContentProvider(table, null, null, contextId);

        table.setContentProvider(contentProvider);
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private async setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): Promise<TableConfiguration> {
        const columns: IColumnConfiguration[] = [
            new DefaultColumnConfiguration(null, null, null,
                'CONFIG_ITEM_ATTRIBUTE', true, false, true, false, 250, false, false, false, DataType.STRING, true,
                'multiline-cell'
            )
        ];

        const context = ContextService.getInstance().getActiveContext();

        const versions = await context.getObjectList<Version>(KIXObjectType.CONFIG_ITEM_VERSION);
        versions?.sort((a, b) => a.VersionID - b.VersionID);

        const allVersions = await context.getObjectList<Version>('ALL_VERSIONS');
        allVersions?.sort((a, b) => a.VersionID - b.VersionID);

        if (Array.isArray(versions)) {

            for (const v of versions) {
                const versionNumber = this.getVersionNumber(v.VersionID, allVersions);
                const column = new DefaultColumnConfiguration(
                    null, null, null,
                    v.VersionID.toString(), true, false, true, false, 250,
                    false, false, false, DataType.STRING, true, 'multiline-cell',
                    `Version ${versionNumber}`
                );
                columns.push(column);
            }
        }

        tableConfiguration = new TableConfiguration(null, null, null,
            KIXObjectType.CONFIG_ITEM_VERSION_COMPARE, null, null, columns, [], false, false, null, null,
            TableHeaderHeight.LARGE, TableRowHeight.LARGE, null, null, true
        );
        tableConfiguration.displayLimit = 18;

        return tableConfiguration;
    }

    private getVersionNumber(versionId: number, versions: Version[]): number {
        const index = versions.findIndex((v) => v.VersionID === versionId);
        return index + 1;
    }

}
