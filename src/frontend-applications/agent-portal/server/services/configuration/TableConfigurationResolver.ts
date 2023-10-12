/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */


import { IConfigurationResolver } from './IConfigurationResolver';
import { TableConfiguration } from '../../../model/configuration/TableConfiguration';
import { IColumnConfiguration } from '../../../model/configuration/IColumnConfiguration';
import { ResolverUtil } from './ResolverUtil';
import { SysConfigOption } from '../../../modules/sysconfig/model/SysConfigOption';

export class TableConfigurationResolver implements IConfigurationResolver<TableConfiguration> {

    private static INSTANCE: TableConfigurationResolver;

    public static getInstance(): TableConfigurationResolver {
        if (!TableConfigurationResolver.INSTANCE) {
            TableConfigurationResolver.INSTANCE = new TableConfigurationResolver();
        }
        return TableConfigurationResolver.INSTANCE;
    }

    private constructor() { }

    public async resolve(
        token: string, tableConfig: TableConfiguration, sysConfigOptions: SysConfigOption[]
    ): Promise<void> {
        if (tableConfig && tableConfig.tableColumnConfigurations) {
            if (!tableConfig.tableColumns
                && tableConfig.tableColumnConfigurations
                && tableConfig.tableColumnConfigurations.length
            ) {
                tableConfig.tableColumns = [];
            }

            tableConfig.tableColumns = await ResolverUtil.loadConfigurations<IColumnConfiguration>(
                token, tableConfig.tableColumnConfigurations, tableConfig.tableColumns, sysConfigOptions
            );
        }
    }

}
