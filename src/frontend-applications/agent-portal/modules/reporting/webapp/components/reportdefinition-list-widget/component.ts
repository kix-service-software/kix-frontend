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
import { ContextUIEvent } from '../../../../base-components/webapp/core/ContextUIEvent';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { TableEvent } from '../../../../table/model/TableEvent';

class Component extends AbstractMarkoComponent<ComponentState> {

    private selectionTimeout: ReturnType<typeof setTimeout>;

    public onCreate(input: any): void {
        super.onCreate(input, 'reportdefinition-list-widget');
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        if (this.context) {
            super.registerEventSubscriber(
                function (data: any, eventId: string): void {
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
                                this.context?.setFilteredObjectList(
                                    KIXObjectType.REPORT_DEFINITION,
                                    table?.getSelectedRows().map((r) => r.getRowObject().getObject())
                                );
                            }
                        }, 150);
                    } else if (
                        eventId === TableEvent.ROW_SELECTION_CHANGED &&
                        data.table.getObjectType() === KIXObjectType.REPORT_DEFINITION
                    ) {
                        if (this.selectionTimeout) {
                            clearTimeout(this.selectionTimeout);
                        }
                        this.selectionTimeout = setTimeout(() => {
                            this.context?.setFilteredObjectList(
                                KIXObjectType.REPORT_DEFINITION,
                                data.table.getSelectedRows().map((r) => r.getRowObject().getObject())
                            );
                            this.state.prepared = true;
                            this.selectionTimeout = null;
                        }, 100);
                    }
                },
                [
                    ContextUIEvent.RELOAD_OBJECTS,
                    ContextUIEvent.RELOAD_OBJECTS_FINISHED,
                    TableEvent.ROW_SELECTION_CHANGED
                ]
            );
        }

        this.state.prepared = true;
    }

    public onDestroy(): void {
        super.onDestroy();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }
}

module.exports = Component;
