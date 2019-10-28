/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType, DataType, ArticleProperty } from "../../../model";
import {
    TableConfiguration, ITable, Table, DefaultColumnConfiguration, ToggleOptions,
    TableHeaderHeight, TableRowHeight, TableEvent, IColumnConfiguration
} from "../../table";
import { ArticleTableContentProvider } from "./new";
import { EventService } from "../../event";
import { ArticleTableToggleSubscriber } from "./ArticleTableToggleSubscriber";
import { TableFactory } from "../../table/TableFactory";

export class ArticleTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.ARTICLE;

    public constructor() {
        super();
        EventService.getInstance().subscribe(TableEvent.ROW_TOGGLED, new ArticleTableToggleSubscriber());
    }

    public createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: Array<number | string>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean, short?: boolean
    ): ITable {

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
            new DefaultColumnConfiguration(
                ArticleProperty.NUMBER, true, false, true, false, 60, true, true, false, DataType.STRING, false
            ),
            new DefaultColumnConfiguration(
                ArticleProperty.ARTICLE_INFORMATION, false, true, true, false, 60,
                false, false, false, DataType.STRING, false
            ),
            new DefaultColumnConfiguration(
                ArticleProperty.SENDER_TYPE_ID, true, false, true, false, 120, true, true, true,
                undefined, undefined, undefined, 'Translatable#Sender'
            ),
            new DefaultColumnConfiguration(ArticleProperty.FROM, true, false, true, false, 300, true, true),
            new DefaultColumnConfiguration(
                ArticleProperty.CHANNEL_ID, false, true, true, false, 75, true, true, true
            ),
            new DefaultColumnConfiguration(ArticleProperty.SUBJECT, true, false, true, false, 500, true, true),
            new DefaultColumnConfiguration(
                ArticleProperty.INCOMING_TIME, true, false, true, false, 125,
                true, true, false, DataType.DATE_TIME
            ),
            new DefaultColumnConfiguration(
                ArticleProperty.ATTACHMENTS, true, true, true, false, 75,
                false, false, false, DataType.STRING, false, 'article-attachment-cell'
            )
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(
                KIXObjectType.ARTICLE, null, undefined, tableColumns, true, true, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.LARGE
            );
            defaultToggle = true;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultToggle) {
            tableConfiguration.toggle = true;
            tableConfiguration.toggleOptions = new ToggleOptions('ticket-article-details', 'article', [
                'article-reply-action',
                'article-forward-action',
                'article-edit-action',
                'article-communication-action',
                'article-tag-action',
                'article-maximize-action'
            ], true);
        }

        return tableConfiguration;
    }

}
