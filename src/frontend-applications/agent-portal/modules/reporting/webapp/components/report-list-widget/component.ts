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
                    if (eventId === TableEvent.ROW_SELECTION_CHANGED &&
                        data.table.getObjectType() === KIXObjectType.REPORT) {
                        context.setFilteredObjectList(KIXObjectType.REPORT,
                            data.table.getSelectedRows().map((r) => r.getRowObject().getObject()));
                        this.state.prepared = true;
                    }
                }
            };
            EventService.getInstance().subscribe(TableEvent.ROW_SELECTION_CHANGED, this.subscriber);
        }

        this.state.prepared = true;
    }

    public async onDestroy(): Promise<void> {
        EventService.getInstance().unsubscribe(TableEvent.ROW_SELECTION_CHANGED, this.subscriber);
    }
}

module.exports = Component;
