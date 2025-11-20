/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../../base-components/webapp/core/AbstractMarkoComponent';
import { EventService } from '../../../../../base-components/webapp/core/EventService';
import { SelectionState } from '../../../../model/SelectionState';
import { Table } from '../../../../model/Table';
import { TableEvent } from '../../../../model/TableEvent';
import { TableEventData } from '../../../../model/TableEventData';
import { ComponentState } from './ComponentState';

class Component extends AbstractMarkoComponent<ComponentState> {

    private table: Table;

    public onCreate(input: any): void {
        super.onCreate(input, 'kix-table/table-head-row');
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.table = input.table;
        this.state.columns = this.table.getColumns();
        if (this.table.getTableConfiguration().toggleOptions) {
            this.state.toggleAll = this.table.getTableConfiguration().toggleOptions.toggleAll;
        }

        return input;
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        super.registerEventSubscriber(
            function (data: TableEventData, eventId: string, subscriberId?: string): void {
                if (data?.tableId !== this.table.getTableId()) return;

                this.state.columns = this.table.getColumns();
                this.setCheckState();
            },
            [
                TableEvent.ROW_SELECTION_CHANGED,
                TableEvent.REFRESH,
                TableEvent.ROW_TOGGLED,
                TableEvent.RERENDER_TABLE,
                TableEvent.COLUMN_CREATED
            ]
        );

        this.setCheckState();
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

    public onDestroy(): void {
        super.onDestroy();
    }
}

module.exports = Component;
