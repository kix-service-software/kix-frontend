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
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { ApplicationEvent } from '../../../../base-components/webapp/core/ApplicationEvent';
import { BackendNotification } from '../../../../../model/BackendNotification';
import { Table } from '../../../../table/model/Table';
import { TableEvent } from '../../../../table/model/TableEvent';
import { TableEventData } from '../../../../table/model/TableEventData';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(input: any): void {
        super.onCreate(input, 'admin-import-export-templates');
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        super.registerEventSubscriber(
            function (data: BackendNotification, eventId: string): void {
                if (data.Namespace === 'ImportExportTemplate.ImportExportTemplateRun') {
                    this.updateTable();
                }
            },
            [
                ApplicationEvent.OBJECT_UPDATED,
                ApplicationEvent.OBJECT_CREATED
            ]
        );
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


    public onDestroy(): void {
        super.onDestroy();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }
}

module.exports = Component;
