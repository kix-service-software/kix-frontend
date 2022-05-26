/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../../base-components/webapp/core/AbstractMarkoComponent';
import { EventService } from '../../../../../base-components/webapp/core/EventService';
import { IEventSubscriber } from '../../../../../base-components/webapp/core/IEventSubscriber';
import { Table } from '../../../../model/Table';
import { TableEvent } from '../../../../model/TableEvent';
import { TableEventData } from '../../../../model/TableEventData';
import { ComponentState } from './ComponentState';

class Component extends AbstractMarkoComponent<ComponentState> implements IEventSubscriber {

    public eventSubscriberId: string = 'table-body';

    public columnLength: number = 0;
    public selectionEnabled: boolean;
    public toggleEnabled: boolean;

    private table: Table;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        if (input.table) {
            const t: Table = input.table;
            this.eventSubscriberId = 'table-body-' + t.getTableId();
            this.columnLength = t.getColumns().length;
            this.selectionEnabled = t.getTableConfiguration().enableSelection;
            this.toggleEnabled = t.getTableConfiguration().toggle;
        }
        this.table = input.table;
    }

    public async onMount(): Promise<void> {

        EventService.getInstance().subscribe(TableEvent.REFRESH, this);
        EventService.getInstance().subscribe(TableEvent.RERENDER_TABLE, this);
        EventService.getInstance().subscribe(TableEvent.SORTED, this);
        EventService.getInstance().subscribe(TableEvent.TABLE_FILTERED, this);
        EventService.getInstance().subscribe(TableEvent.TABLE_INITIALIZED, this);
        EventService.getInstance().subscribe(TableEvent.RELOAD, this);
        EventService.getInstance().subscribe(TableEvent.RELOADED, this);

        this.state.rows = this.table.getRows();

        setTimeout(() => {
            this.state.ready = true;
        }, 100);
    }

    public async eventPublished(data: TableEventData, eventId: string, subscriberId?: string): Promise<void> {
        if (this.table && data.tableId === this.table.getTableId()) {
            if (eventId === TableEvent.RELOAD) {
                this.state.loading = true;
            } else if (eventId === TableEvent.RELOADED) {
                if (this.table.isFiltered()) {
                    this.table.filter();
                }
                this.state.rows = this.table.getRows();
                this.state.loading = false;
            } else {
                const rows = this.table.getRows();
                if (this.table.getTableConfiguration().displayLimit) {
                    const promises = [];
                    for (let i = 0; i < this.table.getTableConfiguration().displayLimit; i++) {
                        if (rows[i]) {
                            promises.push(rows[i].initializeDisplayValues());
                        }
                    }

                    await Promise.all(promises);
                }

                this.state.rows = rows;
            }
        }
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(TableEvent.REFRESH, this);
        EventService.getInstance().unsubscribe(TableEvent.RERENDER_TABLE, this);
        EventService.getInstance().unsubscribe(TableEvent.SORTED, this);
        EventService.getInstance().unsubscribe(TableEvent.TABLE_FILTERED, this);
        EventService.getInstance().unsubscribe(TableEvent.TABLE_INITIALIZED, this);
    }

    public getFullColumnLength(): number {
        let columnLength = this.columnLength + 1;
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
}

module.exports = Component;