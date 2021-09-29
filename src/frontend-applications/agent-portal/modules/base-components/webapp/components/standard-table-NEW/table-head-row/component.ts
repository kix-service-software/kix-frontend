/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { IEventSubscriber } from '../../../../../../modules/base-components/webapp/core/IEventSubscriber';
import { Table, TableEvent, TableEventData, SelectionState } from '../../../core/table';
import { EventService } from '../../../../../../modules/base-components/webapp/core/EventService';

class Component extends AbstractMarkoComponent<ComponentState> implements IEventSubscriber {

    public eventSubscriberId: string;

    private table: Table;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.table = input.table;
        this.state.columns = this.table.getColumns();
        if (this.table.getTableConfiguration().toggleOptions) {
            this.state.toggleAll = this.table.getTableConfiguration().toggleOptions.toggleAll;
        }

        return input;
    }

    public async onMount(): Promise<void> {
        this.eventSubscriberId = this.table.getTableId() + '-head';
        EventService.getInstance().subscribe(TableEvent.ROW_SELECTION_CHANGED, this);
        EventService.getInstance().subscribe(TableEvent.REFRESH, this);
        EventService.getInstance().subscribe(TableEvent.ROW_TOGGLED, this);
        EventService.getInstance().subscribe(TableEvent.RERENDER_TABLE, this);
        EventService.getInstance().subscribe(TableEvent.COLUMN_CREATED, this);
        this.setCheckState();
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(TableEvent.ROW_SELECTION_CHANGED, this);
        EventService.getInstance().unsubscribe(TableEvent.REFRESH, this);
        EventService.getInstance().unsubscribe(TableEvent.ROW_TOGGLED, this);
        EventService.getInstance().unsubscribe(TableEvent.RERENDER_TABLE, this);
        EventService.getInstance().unsubscribe(TableEvent.COLUMN_CREATED, this);
    }

    public eventPublished(data: TableEventData, eventId: string, subscriberId?: string): void {
        if (data && data.tableId === this.table.getTableId()) {
            if (eventId === TableEvent.ROW_SELECTION_CHANGED
                || eventId === TableEvent.REFRESH
                || eventId === TableEvent.ROW_TOGGLED
                || eventId === TableEvent.RERENDER_TABLE
                || eventId === TableEvent.COLUMN_CREATED
            ) {
                this.state.columns = this.table.getColumns();
                this.setCheckState();
            }
        }
    }

    private setCheckState(): void {
        const checkBox = (this as any).getEl('allCheck');
        if (this.table && checkBox) {
            const checkState = this.table.getRowSelectionState();
            let checked = true;
            let indeterminate = false;
            if (checkState !== SelectionState.ALL) {
                checked = false;
                if (checkState !== SelectionState.NONE) {
                    indeterminate = true;
                }
            }
            setTimeout(() => {
                checkBox.checked = checked;
                checkBox.indeterminate = indeterminate;
            }, 10);
        }
    }

    public getHeaderHeight(): string {
        const headRowHeight = this.table.getTableConfiguration().headerHeight;
        return (headRowHeight ? headRowHeight : 2.25).toString() + 'rem';
    }

    public isSelectable(): boolean {
        return this.table.getTableConfiguration().enableSelection;
    }

    public isToggleable(): boolean {
        return this.table.getTableConfiguration().toggle;
    }

    public selectionChanged(): void {
        if (this.table.getRowSelectionState() !== SelectionState.ALL) {
            this.table.selectAll();
        } else {
            this.table.selectNone();
        }
    }

    public firstColumnIsFixed(): boolean {
        return this.table.getTableConfiguration().fixedFirstColumn;
    }

    public toggleAll(open: boolean): void {
        EventService.getInstance().publish(
            TableEvent.TOGGLE_ROWS, new TableEventData(this.table.getTableId(), null, null, null, open)
        );
        this.state.closeAll = open;
    }
}

module.exports = Component;
