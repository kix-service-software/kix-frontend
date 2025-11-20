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
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { TableEvent } from '../../../../table/model/TableEvent';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(input: any): void {
        super.onCreate(input, 'report-list-widget');
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        if (this.context) {
            super.registerEventSubscriber(
                function (data: any, eventId: string): void {
                    if (data.table.getObjectType() === KIXObjectType.REPORT) {
                        this.context.setFilteredObjectList(KIXObjectType.REPORT,
                            data.table.getSelectedRows().map((r) => r.getRowObject().getObject()));
                        this.state.prepared = true;
                    }
                },
                [TableEvent.ROW_SELECTION_CHANGED]
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
