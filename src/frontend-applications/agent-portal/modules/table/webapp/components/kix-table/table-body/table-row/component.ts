/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../../../base-components/webapp/core/AbstractMarkoComponent';
import { EventService } from '../../../../../../base-components/webapp/core/EventService';
import { IEventSubscriber } from '../../../../../../base-components/webapp/core/IEventSubscriber';
import { RoutingService } from '../../../../../../base-components/webapp/core/RoutingService';
import { Cell } from '../../../../../model/Cell';
import { Column } from '../../../../../model/Column';
import { TableEvent } from '../../../../../model/TableEvent';
import { TableEventData } from '../../../../../model/TableEventData';
import { TableCSSHandlerRegistry } from '../../../../core/css-handler/TableCSSHandlerRegistry';
import { ComponentState } from './ComponentState';

class Component extends AbstractMarkoComponent<ComponentState> implements IEventSubscriber {

    public eventSubscriberId: string;

    private observer: IntersectionObserver;

    private bindingIds: string[] = [];

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        if (this.bindingIds?.length) {
            this.state.row?.removeBindings(this.bindingIds);
        }

        this.state.row = input.row;

        if (this.state.row) {

            this.bindingIds = [];
            this.bindingIds.push(
                this.state.row.addBinding('selected', (selected: boolean) => this.state.selected = selected)
            );
            this.bindingIds.push(
                this.state.row.addBinding('canBeSelected', (selectable: boolean) => this.state.selectable = selectable)
            );
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

            EventService.getInstance().subscribe(TableEvent.ROW_TOGGLED, this);
            EventService.getInstance().subscribe(TableEvent.ROW_VALUE_STATE_CHANGED, this);
            EventService.getInstance().subscribe(TableEvent.ROW_VALUE_CHANGED, this);
            EventService.getInstance().subscribe(TableEvent.TOGGLE_ROWS, this);
            this.prepareObserver();
        }
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(TableEvent.ROW_TOGGLED, this);
        EventService.getInstance().unsubscribe(TableEvent.ROW_VALUE_STATE_CHANGED, this);
        EventService.getInstance().unsubscribe(TableEvent.ROW_VALUE_CHANGED, this);
        EventService.getInstance().unsubscribe(TableEvent.TOGGLE_ROWS, this);

        if (this.bindingIds?.length) {
            this.state.row.removeBindings(this.bindingIds);
        }

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
                if (eventId === TableEvent.ROW_TOGGLED) {
                    this.state.open = this.state.row.isExpanded();
                }
                if ((eventId === TableEvent.ROW_VALUE_STATE_CHANGED || eventId === TableEvent.ROW_VALUE_CHANGED)) {
                    this.setRowClasses();
                }

                (this as any).setStateDirty();
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

        this.state.selected = !this.state.selected;
        this.state.row.select(this.state.selected);
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
        if (!config?.routingConfiguration && config?.toggle) {
            this.toggleRow(event);
        }

        if (config.routingConfiguration) {
            const object = this.state.row?.getRowObject()?.getObject();
            let objectId;
            if (object) {
                objectId = object[config?.routingConfiguration?.objectIdProperty];
            }
            RoutingService.getInstance().routeTo(config?.routingConfiguration, objectId);
        }

        EventService.getInstance().publish(
            TableEvent.ROW_CLICKED,
            new TableEventData(
                this.state.row.getTable().getTableId(), this.state.row.getRowId(), null, this.state.row.getTable()
            )
        );
    }

}

module.exports = Component;
