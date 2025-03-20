/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IdService } from '../../../../../model/IdService';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { BrowserUtil } from '../../../../base-components/webapp/core/BrowserUtil';
import { ClientStorageService } from '../../../../base-components/webapp/core/ClientStorageService';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
import { Column } from '../../../model/Column';
import { Row } from '../../../model/Row';
import { Table } from '../../../model/Table';
import { TableEvent } from '../../../model/TableEvent';
import { TableEventData } from '../../../model/TableEventData';
import { ComponentState } from './ComponentState';

class Component extends AbstractMarkoComponent<ComponentState> {

    public eventSubscriberId: string;
    private browserFontSize: number;
    private subscriber: IEventSubscriber;

    public onCreate(input: any): void {
        this.state = new ComponentState();
        this.browserFontSize = BrowserUtil.getBrowserFontsize();
    }

    public onInput(input: any): void {
        if (!this.state.table && input.table || this.isTableChanged(input.table)) {
            if (this.state.table && this.isTableChanged(input.table)) {
                this.state.table.destroy();
            }
            this.state.table = input.table;
            this.init(input.table);
        }
    }

    private isTableChanged(table: Table): boolean {
        return table && this.state.table.getTableId() !== table.getTableId();
    }

    private async init(table: Table): Promise<void> {
        this.eventSubscriberId = table.getTableId();

        await table.initialize(false);
        this.setTableHeight();
    }

    public async onMount(): Promise<void> {

        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId(),
            eventPublished: async (data: TableEventData, eventId: string): Promise<void> => {
                if (this.state.table && data && data.tableId === this.state.table.getTableId()) {
                    if (eventId === TableEvent.TABLE_WAITING_START || eventId === TableEvent.TABLE_WAITING_END) {
                        this.state.showLoadingShield = Boolean(eventId === TableEvent.TABLE_WAITING_START);
                    }

                    if (eventId === TableEvent.REFRESH) {
                        //await this.provideContextContent();
                        this.setTableHeight();
                    }

                    if (eventId === TableEvent.RERENDER_TABLE) {
                        this.setTableHeight();
                    }

                    if (eventId === TableEvent.ROW_TOGGLED) {
                        this.setTableHeight();
                    }

                    if (eventId === TableEvent.SORTED || eventId === TableEvent.TABLE_FILTERED) {
                        const container = (this as any).getEl(this.state.table.getTableId() + 'table-container');
                        if (container) {
                            container.scrollTop = 0;
                        }
                    }
                }

                if (eventId === TableEvent.SCROLL_TO_AND_TOGGLE_ROW) {
                    if (data && data.tableId && data.tableId === this.state.table.getTableId() && data.rowId) {
                        const row: Row = this.state.table.getRow(data.rowId);
                        if (row) {
                            row.expand(true);
                            EventService.getInstance().publish(TableEvent.REFRESH, this.state.table.getTableId());
                            let element: any = document.getElementById(row.getRowId());
                            if (element) {
                                let top = 0;
                                if (element.offsetParent) {
                                    do {
                                        top += element.offsetTop;
                                        element = element.offsetParent;
                                    } while (element !== null);
                                }

                                window.scroll(0, top);
                            }
                        }
                    }
                }
            }
        };

        EventService.getInstance().subscribe(TableEvent.REFRESH, this.subscriber);
        EventService.getInstance().subscribe(TableEvent.RERENDER_TABLE, this.subscriber);
        EventService.getInstance().subscribe(TableEvent.ROW_TOGGLED, this.subscriber);
        EventService.getInstance().subscribe(TableEvent.SORTED, this.subscriber);
        EventService.getInstance().subscribe(TableEvent.TABLE_FILTERED, this.subscriber);
        EventService.getInstance().subscribe(TableEvent.SCROLL_TO_AND_TOGGLE_ROW, this.subscriber);
        EventService.getInstance().subscribe(TableEvent.TABLE_WAITING_START, this.subscriber);
        EventService.getInstance().subscribe(TableEvent.TABLE_WAITING_END, this.subscriber);

        setTimeout(() => {
            const scrollPosString = ClientStorageService.getOption(`${this.state.table?.getTableId()}-scrollpos`);
            const element: HTMLElement = (this as any).getEl(this.state.table?.getTableId() + 'table-container');
            if (scrollPosString && element) {
                try {
                    const scrollPos = JSON.parse(scrollPosString);
                    element.scrollLeft = scrollPos[0];
                    element.scrollTop = scrollPos[1];
                } catch (e) {
                    console.error('Error loading scroll position of table');
                    console.error(e);
                }
            }
        }, 500);
    }

    public onUpdate(): void {
        // nothing
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(TableEvent.REFRESH, this.subscriber);
        EventService.getInstance().unsubscribe(TableEvent.RERENDER_TABLE, this.subscriber);
        EventService.getInstance().unsubscribe(TableEvent.ROW_TOGGLED, this.subscriber);
        EventService.getInstance().unsubscribe(TableEvent.SORTED, this.subscriber);
        EventService.getInstance().unsubscribe(TableEvent.TABLE_FILTERED, this.subscriber);
        EventService.getInstance().unsubscribe(TableEvent.SCROLL_TO_AND_TOGGLE_ROW, this.subscriber);
        EventService.getInstance().unsubscribe(TableEvent.TABLE_WAITING_START, this.subscriber);
        EventService.getInstance().unsubscribe(TableEvent.TABLE_WAITING_END, this.subscriber);
    }

    private async provideContextContent(): Promise<void> {
        if (this.state.table.getContextId()) {
            const context = ContextService.getInstance().getActiveContext();
            if (context) {
                const objects = this.state.table.getRows()
                    .filter((r) => r.getRowObject() !== null && typeof r.getRowObject() !== 'undefined')
                    .map((r) => r.getRowObject().getObject());

                context.setFilteredObjectList(this.state.table.getObjectType(), objects);
            }
        }
    }

    public setTableHeight(): void {
        this.state.tableHeight = '100%';
        const tableConfiguration = this.state.table?.getTableConfiguration();

        if (tableConfiguration?.displayLimit) {

            const rows = this.state.table.getRows(false);
            const displayLimit = tableConfiguration.displayLimit;

            if (rows && rows.length > displayLimit) {

                const headerRowHeight = this.browserFontSize * Number(tableConfiguration.headerHeight);

                const rowHeight = this.browserFontSize * Number(tableConfiguration.rowHeight);
                let height = ((displayLimit * rowHeight) + headerRowHeight);

                const expandedRowHeight = (31.5 + 10) / 2 * this.browserFontSize;
                const expandedRowCount = rows.filter((r) => r.isExpanded()).length;
                height = height + (expandedRowCount * expandedRowHeight);

                this.state.tableHeight = height + 'px';
            }
        }
    }

    private getRowCount(rows: Row[]): number {
        let count = rows.length;
        rows.forEach((r) => count += this.getRowCount(r.getChildren()));
        return count;
    }

    private hScrollWillBeVisible(): boolean {
        let withScroll = false;
        const root = (this as any).getEl();
        if (root) {
            let columnWidth = 0;
            const columns = this.state.table.getColumns();
            columns.forEach((c) => columnWidth += this.getColumnSize(c));
            if (this.state.table.getTableConfiguration().enableSelection) {
                columnWidth += 2.5 * this.browserFontSize;
            }
            if (this.state.table.getTableConfiguration().toggle) {
                columnWidth += 2.5 * this.browserFontSize;
            }

            withScroll = root.getBoundingClientRect().width < columnWidth;
        }
        return withScroll;
    }

    private getColumnSize(column: Column): number {
        let minWidth: number = (2.5 * this.browserFontSize);
        const iconSize = this.browserFontSize * 1.125;
        const config = column.getColumnConfiguration();
        if (config.showColumnIcon || config.showColumnTitle) {
            if (config.filterable) {
                minWidth += iconSize;
            }
            if (config.sortable) {
                minWidth += iconSize;
            }
        } else if (config.filterable && config.sortable) {
            minWidth += iconSize;
        }
        return config.size < minWidth ? minWidth : config.size;
    }

    public onScroll(event: any): void {
        const element = (this as any).getEl(this.state.table?.getTableId() + 'table-container');
        if (element) {
            const scrollInfo = [element?.scrollLeft, element?.scrollTop];
            ClientStorageService.setOption(`${this.state.table.getTableId()}-scrollpos`, JSON.stringify(scrollInfo));
        }
    }
}

module.exports = Component;
