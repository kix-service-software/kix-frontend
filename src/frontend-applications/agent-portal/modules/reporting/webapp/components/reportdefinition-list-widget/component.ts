/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { ContextUIEvent } from '../../../../base-components/webapp/core/ContextUIEvent';
import { IdService } from '../../../../../model/IdService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { TableEvent } from '../../../../table/model/TableEvent';

class Component extends AbstractMarkoComponent<ComponentState> {

    private instanceId: string;
    private subscriber: IEventSubscriber;
    private selectionTimeout;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();

        if (context) {
            this.subscriber = {
                eventSubscriberId: IdService.generateDateBasedId(this.instanceId),
                eventPublished: (data: any, eventId: string): void => {
                    if (eventId === ContextUIEvent.RELOAD_OBJECTS && data === KIXObjectType.REPORT_DEFINITION) {
                        this.state.prepared = false;
                    } else if (
                        eventId === ContextUIEvent.RELOAD_OBJECTS_FINISHED &&
                        data === KIXObjectType.REPORT_DEFINITION
                    ) {
                        this.state.prepared = true;
                        setTimeout(() => {
                            const tableWidgetComponent = (this as any).getComponent('report-definition-table-widget');
                            if (tableWidgetComponent) {
                                const table = tableWidgetComponent.getTable();
                                context.setFilteredObjectList(
                                    KIXObjectType.REPORT_DEFINITION,
                                    table?.getSelectedRows().map((r) => r.getRowObject().getObject())
                                );
                            }
                        }, 150);
                    } else if (
                        eventId === TableEvent.ROW_SELECTION_CHANGED &&
                        data.table.getObjectType() === KIXObjectType.REPORT_DEFINITION &&
                        !this.selectionTimeout // wait for possible further selection changes (select ALL)
                    ) {
                        this.selectionTimeout = setTimeout(() => {
                            context.setFilteredObjectList(
                                KIXObjectType.REPORT_DEFINITION,
                                data.table.getSelectedRows().map((r) => r.getRowObject().getObject())
                            );
                            this.state.prepared = true;
                            this.selectionTimeout = null;
                        }, 200);
                    }
                }
            };
            EventService.getInstance().subscribe(ContextUIEvent.RELOAD_OBJECTS, this.subscriber);
            EventService.getInstance().subscribe(ContextUIEvent.RELOAD_OBJECTS_FINISHED, this.subscriber);
            EventService.getInstance().subscribe(TableEvent.ROW_SELECTION_CHANGED, this.subscriber);
        }

        this.state.prepared = true;
    }

    public async onDestroy(): Promise<void> {
        EventService.getInstance().unsubscribe(ContextUIEvent.RELOAD_OBJECTS, this.subscriber);
        EventService.getInstance().unsubscribe(ContextUIEvent.RELOAD_OBJECTS_FINISHED, this.subscriber);
        EventService.getInstance().unsubscribe(TableEvent.ROW_SELECTION_CHANGED, this.subscriber);
    }
}

module.exports = Component;
