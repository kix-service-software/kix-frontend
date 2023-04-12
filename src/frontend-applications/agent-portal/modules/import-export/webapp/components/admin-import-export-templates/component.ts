/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
import { ApplicationEvent } from '../../../../base-components/webapp/core/ApplicationEvent';
import { IdService } from '../../../../../model/IdService';
import { BackendNotification } from '../../../../../model/BackendNotification';
import { Table } from '../../../../table/model/Table';
import { TableEvent } from '../../../../table/model/TableEvent';
import { TableEventData } from '../../../../table/model/TableEventData';

class Component extends AbstractMarkoComponent<ComponentState> {

    private subscriber: IEventSubscriber;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {

        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId(),
            eventPublished: (data: BackendNotification, eventId: string): void => {
                if (data.Namespace === 'ImportExportTemplate.ImportExportTemplateRun') {
                    this.updateTable();
                }
            }
        };

        EventService.getInstance().subscribe(ApplicationEvent.OBJECT_UPDATED, this.subscriber);
        EventService.getInstance().subscribe(ApplicationEvent.OBJECT_CREATED, this.subscriber);
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(ApplicationEvent.OBJECT_UPDATED, this.subscriber);
        EventService.getInstance().unsubscribe(ApplicationEvent.OBJECT_CREATED, this.subscriber);
    }

    private async updateTable(): Promise<void> {
        const component = (this as any).getComponent(this.state.instanceId);
        if (component) {
            const table: Table = component.state.table;

            await table.reload(true, true);

            const selectedRows = table?.getSelectedRows() || [];
            for (const row of selectedRows) {
                row.expand();
                const data = new TableEventData(table?.getTableId(), row.getRowId());
                EventService.getInstance().publish(TableEvent.ROW_TOGGLED, data);
            }
        }
    }

}

module.exports = Component;
