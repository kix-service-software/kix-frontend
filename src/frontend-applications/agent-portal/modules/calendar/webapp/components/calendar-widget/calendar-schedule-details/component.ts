/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../base-components/webapp/core/AbstractMarkoComponent';
import { LabelService } from '../../../../../base-components/webapp/core/LabelService';
import { TicketProperty } from '../../../../../ticket/model/TicketProperty';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { ContextMode } from '../../../../../../model/ContextMode';
import { RoutingConfiguration } from '../../../../../../model/configuration/RoutingConfiguration';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.ticket = input.ticket;
        const config = input.calendarConfig;
        this.state.properties = config && config.properties && Array.isArray(config.properties)
            ? this.state.properties = config.properties
            : [];
    }

    public async onMount(): Promise<void> {
        this.state.title = this.state.ticket.Title;

        this.state.routingConfiguration = new RoutingConfiguration(
            'ticket-details', KIXObjectType.TICKET, ContextMode.DETAILS, null
        );

        this.state.organisation = await LabelService.getInstance().getPropertyValueDisplayText(
            this.state.ticket, TicketProperty.ORGANISATION_ID
        );

        this.state.ticketNumber = await LabelService.getInstance().getText(
            this.state.ticket, true, false
        );

        const icons = await LabelService.getInstance().getPropertyValueDisplayIcons(
            this.state.ticket, TicketProperty.PRIORITY_ID
        );

        this.state.icon = icons && icons.length ? icons[0] : 'kix-icon-unknown';


        this.state.prepared = true;
    }

}

module.exports = Component;
