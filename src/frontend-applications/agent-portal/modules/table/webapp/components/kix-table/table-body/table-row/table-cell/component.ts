/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { IdService } from '../../../../../../../../model/IdService';
import { AbstractMarkoComponent } from '../../../../../../../base-components/webapp/core/AbstractMarkoComponent';
import { EventService } from '../../../../../../../base-components/webapp/core/EventService';
import { IEventSubscriber } from '../../../../../../../base-components/webapp/core/IEventSubscriber';
import { KIXModulesService } from '../../../../../../../base-components/webapp/core/KIXModulesService';
import { ServiceRegistry } from '../../../../../../../base-components/webapp/core/ServiceRegistry';
import { Cell } from '../../../../../../model/Cell';
import { Column } from '../../../../../../model/Column';
import { TableEvent } from '../../../../../../model/TableEvent';
import { ValueState } from '../../../../../../model/ValueState';
import { TableCSSHandlerRegistry } from '../../../../../core/css-handler/TableCSSHandlerRegistry';
import { IKIXObjectService } from '../../../../../../../base-components/webapp/core/IKIXObjectService';

class Component extends AbstractMarkoComponent<ComponentState> {

    private column: Column;
    private subscriber: IEventSubscriber;
    private cell: Cell;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId(),
            eventPublished: (data: string, eventId: string): void => {
                if (this.cell && data === this.cell.getValue().instanceId) {
                    (this as any).setStateDirty();
                    setTimeout(() => this.state.loading = false, 5);
                }
            }
        };

        await this.cell.getValue().initDisplayValue(this.cell);

        this.state.loading = false;

        EventService.getInstance().subscribe(TableEvent.DISPLAY_VALUE_CHANGED, this.subscriber);
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(TableEvent.DISPLAY_VALUE_CHANGED, this.subscriber);
    }

    public onInput(input: any): void {

        if (input.column) {
            this.column = input.column;
            const componentId = this.column.getColumnConfiguration().componentId;
            this.state.showDefaultCell = !componentId || componentId === '';
        }

        if (input.cell) {
            this.cell = input.cell;
            const table = input.cell.getRow().getTable();
            const tableConfiguration = table.getTableConfiguration();
            const object = input.cell.getRow().getRowObject().getObject();
            if (tableConfiguration && tableConfiguration.routingConfiguration) {
                this.state.object = object;
                this.state.routingConfiguration = tableConfiguration.routingConfiguration;
            } else if (object && object.KIXObjectType) {
                const service = ServiceRegistry.getServiceInstance<IKIXObjectService>(object.KIXObjectType);
                if (service) {
                    this.state.routingConfiguration = service.getObjectRoutingConfiguration(object);
                }
            }

            if (
                this.state.routingConfiguration
                && this.state.routingConfiguration.objectIdProperty
                && object
            ) {
                this.state.objectId = object[this.state.routingConfiguration.objectIdProperty];
            }

            this.setValueStateClass(input.cell);
        }
    }

    public getCellTemplate(): any {
        if (this.column) {
            return KIXModulesService.getComponentTemplate(
                this.column.getColumnConfiguration().componentId
            );
        }
        return undefined;
    }

    private async setValueStateClass(cell: Cell): Promise<void> {
        let classes = [];
        const state = cell.getValue().state && cell.getValue().state !== ValueState.NONE
            ? cell.getValue().state : cell.getRow().getRowObject().getValueState();
        if (state) {
            switch (state) {
                case ValueState.CHANGED:
                    classes.push('cell-value-changed');
                    break;
                case ValueState.DELETED:
                    classes.push('cell-value-deleted');
                    break;
                case ValueState.NEW:
                    classes.push('cell-value-new');
                    break;
                case ValueState.NOT_EXISTING:
                    classes.push('cell-value-not-existing');
                    break;
                case ValueState.HIGHLIGHT_ERROR:
                    classes.push('cell-value-highlight_error');
                    break;
                case ValueState.HIGHLIGHT_REMOVED:
                    classes.push('cell-value-highlight_removed');
                    break;
                case ValueState.HIGHLIGHT_UNAVAILABLE:
                    classes.push('cell-value-highlight_unavailable');
                    break;
                case ValueState.HIGHLIGHT_SUCCESS:
                    classes.push('cell-value-highlight_success');
                    break;
                default:
            }
        }

        const object = cell.getRow().getRowObject().getObject();
        if (object) {
            const objectType = cell.getRow().getTable().getObjectType();
            const cssHandler = TableCSSHandlerRegistry.getObjectCSSHandler(objectType);
            if (cssHandler) {
                for (const handler of cssHandler) {
                    const valueClasses = await handler.getValueCSSClasses(object, cell.getValue());
                    valueClasses.forEach((c) => classes.push(c));
                }
            }

            const commonHandler = TableCSSHandlerRegistry.getCommonCSSHandler();
            for (const h of commonHandler) {
                const valueClasses = await h.getValueCSSClasses(object, cell.getValue());
                classes = [...classes, ...valueClasses];
            }
        }

        this.state.stateClasses = classes;
    }
}

module.exports = Component;
