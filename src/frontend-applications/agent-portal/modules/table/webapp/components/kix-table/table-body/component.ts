/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../../base-components/webapp/core/AbstractMarkoComponent';
import { BrowserUtil } from '../../../../../base-components/webapp/core/BrowserUtil';
import { Table } from '../../../../model/Table';
import { TableEvent } from '../../../../model/TableEvent';
import { TableEventData } from '../../../../model/TableEventData';
import { ComponentState } from './ComponentState';

class Component extends AbstractMarkoComponent<ComponentState> {

    public columnLength: number = 0;
    public selectionEnabled: boolean;
    public toggleEnabled: boolean;

    private table: Table;

    public onCreate(input: any): void {
        super.onCreate(input, 'kix-table/table-body');
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        if (input.table) {
            const t: Table = input.table;
            this.columnLength = t.getColumns().length;
            this.selectionEnabled = t.getTableConfiguration().enableSelection;
            this.toggleEnabled = t.getTableConfiguration().toggle;
        }
        this.table = input.table;
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        super.registerEventSubscriber(
            async function (data: TableEventData, eventId: string, subscriberId?: string): Promise<void> {
                if (data.tableId === this.table?.getTableId()) {
                    this.state.rows = this.table.getRows();
                    this.prepareLoadMore();
                }
            },
            [
                TableEvent.REFRESH,
                TableEvent.RERENDER_TABLE,
                TableEvent.SORTED,
                TableEvent.TABLE_FILTERED,
                TableEvent.TABLE_INITIALIZED,
                TableEvent.RELOAD,
                TableEvent.RELOADED
            ]
        );

        this.state.rows = this.table.getRows();
        this.prepareLoadMore();
    }

    private prepareLoadMore(): void {
        const usePaging = this.table.getContentProvider().usePaging;
        const currentCount = this.table?.getContentProvider()?.currentLimit || this.table?.getRows(true)?.length;
        const totalCount = this.table?.getContentProvider()?.totalCount;
        this.state.canLoadMore = usePaging && (currentCount < totalCount);
    }


    public getFullColumnLength(): number {
        let columnLength = (this.columnLength || this.table?.getColumns()?.length || 0) + 1;
        if (this.selectionEnabled) {
            columnLength++;
        }
        if (this.toggleEnabled) {
            columnLength++;
        }
        return columnLength;
    }

    public getEmptyString(): string {
        return this.table ? this.table.getTableConfiguration().emptyResultHint : 'Translatable#No objects available.';
    }

    public getRowHeight(): string {
        return (this.table ? this.table.getTableConfiguration().rowHeight : 1.75) + 'rem';
    }

    public async loadMore(): Promise<void> {
        this.state.loadMore = true;
        await this.table?.loadMore();
        this.state.loadMore = false;

        setTimeout(() => {
            const loadMoreButton = document.getElementById(this.state.loadMoreButtonId);
            if (loadMoreButton) {
                BrowserUtil.scrollIntoViewIfNeeded(loadMoreButton);
            }
        }, 20);
    }

    public onDestroy(): void {
        super.onDestroy();
    }
}

module.exports = Component;
