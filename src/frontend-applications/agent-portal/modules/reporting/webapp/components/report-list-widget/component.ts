/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
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

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = await ContextService.getInstance().getActiveContext();

        if (context) {
            this.subscriber = {
                eventSubscriberId: IdService.generateDateBasedId(this.instanceId),
                eventPublished: (data: any, eventId: string): void => {
                    if (eventId === ContextUIEvent.RELOAD_OBJECTS && data === KIXObjectType.REPORT) {
                        this.state.prepared = false;
                    } else if (eventId === ContextUIEvent.RELOAD_OBJECTS_FINISHED &&
                        data === KIXObjectType.REPORT) {
                        this.state.prepared = true;
                    } else if (eventId === TableEvent.ROW_SELECTION_CHANGED &&
                        data.table.getObjectType() === KIXObjectType.REPORT) {
                        context.setFilteredObjectList(KIXObjectType.REPORT,
                            data.table.getSelectedRows().map((r) => r.getRowObject().getObject()));
                        this.state.prepared = true;
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
