/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableFactory } from '../../../../base-components/webapp/core/table/TableFactory';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
import { Table, TableEvent, TableEventData } from '../../../../base-components/webapp/core/table';
import { LogFileTableContentProvider } from './LogFileTableContentProvider';
import { EventService } from '../../../../../modules/base-components/webapp/core/EventService';
import { TableHeaderHeight } from '../../../../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../../../../model/configuration/TableRowHeight';
import { IColumnConfiguration } from '../../../../../model/configuration/IColumnConfiguration';
import { DefaultColumnConfiguration } from '../../../../../model/configuration/DefaultColumnConfiguration';
import { DataType } from '../../../../../model/DataType';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { BrowserUtil } from '../../../../../modules/base-components/webapp/core/BrowserUtil';
import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { LogFileProperty } from '../../../model/LogFileProperty';
import { LogFile } from '../../../model/LogFile';

export class LogFileTableFactory extends TableFactory {

    public objectType: KIXObjectType | string = KIXObjectType.LOG_FILE;

    public async createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: number[], contextId?: string,
        defaultRouting?: boolean, defaultToggle?: boolean
    ): Promise<Table> {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);
        const table = new Table(tableKey, tableConfiguration);

        table.setContentProvider(
            new LogFileTableContentProvider(table, objectIds, null, contextId)
        );
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        EventService.getInstance().subscribe(TableEvent.ROW_CLICKED, {
            eventSubscriberId: 'logs-table-listener',
            eventPublished: (data: TableEventData, eventId: string, subscriberId?: string) => {
                if (eventId === TableEvent.ROW_CLICKED) {
                    const row = table.getRow(data.rowId);
                    if (row) {
                        const logFile = row.getRowObject().getObject();
                        this.downloadLogFile(logFile);
                    }
                }
            }
        });

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            this.getDefaultColumnConfiguration(LogFileProperty.DISPLAY_NAME),
            this.getDefaultColumnConfiguration(LogFileProperty.FILE_SIZE),
            this.getDefaultColumnConfiguration(LogFileProperty.MODIFIY_TIME),
            new DefaultColumnConfiguration(
                null, null, null, LogFileProperty.CONTENT, false, true, true, false, undefined,
                false, false, false, DataType.STRING, false, 'system-logfile-view-cell', 'Translatable#View'
            )
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(null, null, null,
                KIXObjectType.LOG_FILE, null, null, tableColumns, [], false, false, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.LARGE
            );
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        return tableConfiguration;
    }

    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        let config;
        switch (property) {
            case LogFileProperty.DISPLAY_NAME:
                config = new DefaultColumnConfiguration(null, null, null,
                    property, true, false, true, false, 350, true, false,
                    false, DataType.STRING, true, null, null, false
                );
                break;
            case LogFileProperty.FILE_SIZE:
                config = new DefaultColumnConfiguration(null, null, null,
                    property, true, false, true, false, 100, true, false,
                    false, DataType.STRING, true, null, null, false
                );
                break;
            case LogFileProperty.MODIFIY_TIME:
                config = new DefaultColumnConfiguration(null, null, null,
                    property, true, false, true, false, 200, true, false,
                    false, DataType.DATE_TIME, true, null, null, false
                );
                break;
            default:
                config = super.getDefaultColumnConfiguration(property);
        }
        return config;
    }

    private async downloadLogFile(logFile: LogFile): Promise<void> {
        const files = await KIXObjectService.loadObjects<LogFile>(
            KIXObjectType.LOG_FILE, [logFile.ID],
            new KIXObjectLoadingOptions(null, null, null, [LogFileProperty.CONTENT]), null, false, false
        );

        if (files && files.length) {
            BrowserUtil.startBrowserDownload(files[0].Filename, files[0].Content, 'text/plain');
        }
    }
}
