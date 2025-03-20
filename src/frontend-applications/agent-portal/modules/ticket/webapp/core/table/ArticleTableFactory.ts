/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableFactory } from '../../../../table/webapp/core/factory/TableFactory';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { EventService } from '../../../../../modules/base-components/webapp/core/EventService';
import { ArticleTableToggleSubscriber } from './ArticleTableToggleSubscriber';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
import { ArticleTableContentProvider } from '.';
import { DefaultColumnConfiguration } from '../../../../../model/configuration/DefaultColumnConfiguration';
import { ArticleProperty } from '../../../model/ArticleProperty';
import { DataType } from '../../../../../model/DataType';
import { TableHeaderHeight } from '../../../../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../../../../model/configuration/TableRowHeight';
import { Table } from '../../../../table/model/Table';
import { TableEvent } from '../../../../table/model/TableEvent';

export class ArticleTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.ARTICLE;

    public constructor() {
        super();
        EventService.getInstance().subscribe(TableEvent.ROW_TOGGLED, new ArticleTableToggleSubscriber());
    }

    public async createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: Array<number | string>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean, short?: boolean
    ): Promise<Table> {

        tableConfiguration = this.setDefaultTableConfiguration(
            tableConfiguration, defaultRouting, defaultToggle, short
        );

        const table = new Table(tableKey, tableConfiguration);

        const contentProvider = new ArticleTableContentProvider(table, null, null, contextId);

        table.setContentProvider(contentProvider);
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean, short?: boolean
    ): TableConfiguration {
        const tableColumns = [
            new DefaultColumnConfiguration(null, null, null,
                ArticleProperty.NUMBER, true, false, true, false, 60, true, true, false, DataType.STRING, false
            ),
            new DefaultColumnConfiguration(null, null, null,
                ArticleProperty.ARTICLE_INFORMATION, false, true, true, false, 60,
                false, false, false, DataType.STRING, false
            ),
            new DefaultColumnConfiguration(null, null, null,
                ArticleProperty.SENDER_TYPE_ID, true, false, true, false, 120, true, true, true,
                undefined, undefined, undefined, 'Translatable#Sender Type'
            ),
            new DefaultColumnConfiguration(
                null, null, null, ArticleProperty.FROM, true, false, true, false, 300, true, true),
            new DefaultColumnConfiguration(null, null, null,
                ArticleProperty.CUSTOMER_VISIBLE, false, true, false, true, 75, true, true, true
            ),
            new DefaultColumnConfiguration(null, null, null,
                ArticleProperty.CHANNEL_ID, false, true, true, false, 75, true, true, true
            ),
            new DefaultColumnConfiguration(
                null, null, null, ArticleProperty.SUBJECT, true, false, true, false, 500, true, true),
            new DefaultColumnConfiguration(null, null, null,
                ArticleProperty.INCOMING_TIME, true, false, true, false, 125,
                true, true, false, DataType.DATE_TIME
            ),
            new DefaultColumnConfiguration(null, null, null,
                ArticleProperty.ATTACHMENTS, true, true, true, false, 75,
                false, false, false, DataType.STRING, false, 'article-attachment-cell'
            )
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(null, null, null,
                KIXObjectType.ARTICLE, null, undefined, tableColumns, [], true, true, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.LARGE
            );
            defaultToggle = true;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        return tableConfiguration;
    }

}
