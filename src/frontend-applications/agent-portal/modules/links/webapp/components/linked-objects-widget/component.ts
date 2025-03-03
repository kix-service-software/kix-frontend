/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { TableFactoryService } from '../../../../table/webapp/core/factory/TableFactoryService';
import { Context } from '../../../../../model/Context';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
import { TableHeaderHeight } from '../../../../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../../../../model/configuration/TableRowHeight';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = context
            ? await context.getWidgetConfiguration(this.state.instanceId)
            : undefined;

        context.registerListener('kix-object-linked-objects-widget', {
            objectChanged: (id: string | number, object: KIXObject, type: KIXObjectType) => {
                this.prepareTable(context);
            },
            sidebarRightToggled: (): void => { return; },
            sidebarLeftToggled: (): void => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: (): void => { return; },
            scrollInformationChanged: () => { return; },
            additionalInformationChanged: (): void => { return; }
        });

        this.prepareTable(context);
    }

    private async prepareTable(context: Context): Promise<void> {
        this.state.prepared = false;

        const tableConfiguration = new TableConfiguration(
            null, null, null, KIXObjectType.LINK_OBJECT, null, 25, null, [], false, false,
            null, null, TableHeaderHeight.SMALL, TableRowHeight.SMALL
        );
        const table = await TableFactoryService.getInstance().createTable(
            'linked-objects-widget', KIXObjectType.LINK_OBJECT, tableConfiguration,
            null, null, null, null, null, null, true
        );

        this.state.table = table;

        setTimeout(() => this.state.prepared = true, 10);
    }

}

module.exports = Component;
