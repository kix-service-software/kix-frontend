/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../core/AbstractMarkoComponent';
import { IEventSubscriber } from '../../../../core/IEventSubscriber';
import { EventService } from '../../../../core/EventService';
import { TableEvent, TableEventData, Column, Cell, TableCSSHandlerRegistry } from '../../../../core/table';
import { ClientStorageService } from '../../../../core/ClientStorageService';

class Component extends AbstractMarkoComponent<ComponentState> implements IEventSubscriber {

    public eventSubscriberId: string;

    private observer: IntersectionObserver;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.row = input.row;
        if (this.state.row) {
            this.state.selected = this.state.row.isSelected();
            this.state.selectable = this.state.row.isSelectable();
            this.state.open = this.state.row.isExpanded();
            this.state.children = this.state.row.getChildren();
            this.setRowClasses();
        }
    }

    public async onMount(): Promise<void> {
        if (this.state.row) {
            this.eventSubscriberId = this.state.row.getTable().getTableId() + '-' + this.state.row.getRowId();
            EventService.getInstance().subscribe(TableEvent.ROW_SELECTION_CHANGED, this);
            EventService.getInstance().subscribe(TableEvent.ROW_SELECTABLE_CHANGED, this);
            EventService.getInstance().subscribe(TableEvent.ROW_TOGGLED, this);
            EventService.getInstance().subscribe(TableEvent.ROW_VALUE_STATE_CHANGED, this);
            EventService.getInstance().subscribe(TableEvent.ROW_VALUE_CHANGED, this);
            EventService.getInstance().subscribe(TableEvent.TOGGLE_ROWS, this);
            this.prepareObserver();
        }
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(TableEvent.ROW_SELECTION_CHANGED, this);
        EventService.getInstance().unsubscribe(TableEvent.ROW_SELECTABLE_CHANGED, this);
        EventService.getInstance().unsubscribe(TableEvent.ROW_TOGGLED, this);
        EventService.getInstance().unsubscribe(TableEvent.ROW_VALUE_STATE_CHANGED, this);
        EventService.getInstance().unsubscribe(TableEvent.ROW_VALUE_CHANGED, this);
        EventService.getInstance().unsubscribe(TableEvent.TOGGLE_ROWS, this);

        if (this.observer) {
            this.observer.disconnect();
        }
    }

    private prepareObserver(): void {
        if (!this.state.show && this.supportsIntersectionObserver()) {
            const row = (this as any).getEl();
            if (row) {
                if (this.observer) {
                    this.observer.disconnect();
                }
                this.observer = new IntersectionObserver(this.intersectionCallback.bind(this));
                this.observer.observe(row);
            }
        } else {
            this.state.show = true;
        }
    }

    private supportsIntersectionObserver(): boolean {
        return 'IntersectionObserver' in global
            && 'IntersectionObserverEntry' in global
            && 'intersectionRatio' in IntersectionObserverEntry.prototype;
    }

    private intersectionCallback(entries, observer): void {
        entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio > 0) {
                this.state.show = true;
                this.observer.disconnect();
            }
        });
    }

    public eventPublished(data: TableEventData, eventId: string, subscriberId?: string): void {
        if (data && data.tableId === this.state.row.getTable().getTableId()) {
            if (data.rowId === this.state.row.getRowId()) {
                if (eventId === TableEvent.ROW_SELECTION_CHANGED) {
                    this.state.selected = this.state.row.isSelected();
                }
                if (eventId === TableEvent.ROW_SELECTABLE_CHANGED) {
                    this.state.selectable = this.state.row.isSelectable();
                }
                if (eventId === TableEvent.ROW_TOGGLED) {
                    this.state.open = this.state.row.isExpanded();
                }
                if (
                    (eventId === TableEvent.ROW_VALUE_STATE_CHANGED || eventId === TableEvent.ROW_VALUE_CHANGED)
                    && data.rowId === this.state.row.getRowId()
                ) {
                    this.setRowClasses();
                }
            }

            if (eventId === TableEvent.TOGGLE_ROWS) {
                this.state.open = data.openRows;
                this.state.row.expand(data.openRows);
                this.setRowClasses();
            }
        }
    }

    public toggleRow(event?: any): void {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        this.state.row.expand(!this.state.open);
        this.setRowClasses();
    }

    public changeSelect(event: any): void {
        event.stopPropagation();
        event.preventDefault();
        if (this.state.row.isSelected()) {
            this.state.row.select(false);
        } else {
            this.state.row.select();
        }
    }

    public getColumns(): Column[] {
        return this.state.row ? this.state.row.getTable().getColumns() : [];
    }

    public getCell(columnId: string): Cell {
        return this.state.row.getCell(columnId);
    }

    public getFullColumnCount(isCheckable: boolean, isToggleable: boolean): number {
        let columnLength = this.getColumns().length + 1;
        if (isCheckable) {
            columnLength++;
        }
        if (isToggleable) {
            columnLength++;
        }
        return columnLength;
    }

    public firstColumnIsFixed(): boolean {
        return this.state.row.getTable().getTableConfiguration().fixedFirstColumn;
    }

    private async setRowClasses(): Promise<void> {
        const object = this.state.row.getRowObject().getObject();
        let stateClass = [];

        if (this.state.open) {
            stateClass.push('opened');
        }

        if (this.firstColumnIsFixed()) {
            stateClass.push('fist-column-fixed');
        }

        if (object) {
            const objectType = this.state.row.getTable().getObjectType();
            const cssHandler = TableCSSHandlerRegistry.getObjectCSSHandler(objectType);
            if (cssHandler) {
                for (const handler of cssHandler) {
                    const classes = await handler.getRowCSSClasses(object);
                    classes.forEach((c) => stateClass.push(c));
                }
            }

            const commonHandler = TableCSSHandlerRegistry.getCommonCSSHandler();
            for (const h of commonHandler) {
                const rowClasses = await h.getRowCSSClasses(object);
                stateClass = [...stateClass, ...rowClasses];
            }
        }

        this.state.rowClasses = stateClass;
    }

    public rowClicked(event): void {
        const config = this.state.row.getTable().getTableConfiguration();
        if (!config.routingConfiguration && config.toggle) {
            this.toggleRow(event);
        }

        EventService.getInstance().publish(
            TableEvent.ROW_CLICKED,
            new TableEventData(this.state.row.getTable().getTableId(), this.state.row.getRowId())
        );
    }

}

module.exports = Component;
