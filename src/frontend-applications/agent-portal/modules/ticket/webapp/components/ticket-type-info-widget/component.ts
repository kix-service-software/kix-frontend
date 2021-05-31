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
import { TicketTypeLabelProvider, TicketTypeDetailsContext } from '../../core';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { TicketType } from '../../../model/TicketType';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ActionFactory } from '../../../../../modules/base-components/webapp/core/ActionFactory';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        this.state.labelProvider = new TicketTypeLabelProvider();
        const context = ContextService.getInstance().getActiveContext();
        context.registerListener('ticket-type-info-widget', {
            sidebarRightToggled: () => { return; },
            sidebarLeftToggled: () => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: () => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: async (ticketId: string, ticketType: TicketType, type: KIXObjectType) => {
                if (type === KIXObjectType.TICKET_TYPE) {
                    this.initWidget(ticketType);
                }
            },
            additionalInformationChanged: () => { return; }
        });
        this.state.widgetConfiguration = context
            ? await context.getWidgetConfiguration(this.state.instanceId)
            : undefined;

        await this.initWidget(await context.getObject<TicketType>());
    }

    private async initWidget(ticketType: TicketType): Promise<void> {
        this.state.ticketType = ticketType;
        this.setActions();
    }

    private async setActions(): Promise<void> {
        if (this.state.widgetConfiguration && this.state.ticketType) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.state.ticketType]
            );
        }
    }

}

module.exports = Component;
