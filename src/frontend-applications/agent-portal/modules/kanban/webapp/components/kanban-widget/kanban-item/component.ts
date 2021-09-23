/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../base-components/webapp/core/AbstractMarkoComponent';
import { RoutingConfiguration } from '../../../../../../model/configuration/RoutingConfiguration';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { ContextMode } from '../../../../../../model/ContextMode';
import { LabelService } from '../../../../../base-components/webapp/core/LabelService';
import { TicketProperty } from '../../../../../ticket/model/TicketProperty';
import { EventService } from '../../../../../base-components/webapp/core/EventService';
import { KanbanEvent } from '../../../core/KanbanEvent';
import { KIXObjectLoadingOptions } from '../../../../../../model/KIXObjectLoadingOptions';
import { Ticket } from '../../../../../ticket/model/Ticket';
import { KIXObjectService } from '../../../../../base-components/webapp/core/KIXObjectService';
import { IEventSubscriber } from '../../../../../base-components/webapp/core/IEventSubscriber';
import { ObjectIcon } from '../../../../../icon/model/ObjectIcon';
import { ObjectIconLoadingOptions } from '../../../../../../server/model/ObjectIconLoadingOptions';
import { Contact } from '../../../../../customer/model/Contact';
import { ContactProperty } from '../../../../../customer/model/ContactProperty';
import { FilterCriteria } from '../../../../../../model/FilterCriteria';
import { SearchOperator } from '../../../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../../../model/FilterDataType';
import { FilterType } from '../../../../../../model/FilterType';
import { BrowserUtil } from '../../../../../base-components/webapp/core/BrowserUtil';

class Component extends AbstractMarkoComponent<ComponentState> {

    private kanbanSubscriber: IEventSubscriber;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.ticket = input.ticket;
        this.state.properties =
            input.kanbanConfig && input.kanbanConfig.cardProperties && Array.isArray(input.kanbanConfig.cardProperties)
                ? this.state.properties = input.kanbanConfig.cardProperties
                : [];
    }

    public async onMount(): Promise<void> {

        this.state.routingConfiguration = new RoutingConfiguration(
            'ticket-details', KIXObjectType.TICKET, ContextMode.DETAILS, null
        );

        this.state.title = this.state.ticket.Title;

        this.state.organisation = await LabelService.getInstance().getDisplayText(
            this.state.ticket, TicketProperty.ORGANISATION_ID
        );

        this.state.ticketNumber = await LabelService.getInstance().getObjectText(
            this.state.ticket, true, false
        );

        const icons = await LabelService.getInstance().getIcons(
            this.state.ticket, TicketProperty.PRIORITY_ID
        );

        this.state.icon = icons && icons.length ? icons[0] : 'kix-icon-unknown';

        this.kanbanSubscriber = {
            eventSubscriberId: 'kanban-item-' + this.state.ticket.TicketID,
            eventPublished: this.ticketChanged.bind(this)
        };
        EventService.getInstance().subscribe(KanbanEvent.TICKET_CHANGED, this.kanbanSubscriber);

        await this.prepareAvatar();

        this.state.prepared = true;
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe('kanban-item-' + this.state.ticket.TicketID, this.kanbanSubscriber);
    }

    public expand(): void {
        this.state.expanded = !this.state.expanded;
    }

    public async ticketChanged(data: any, eventId: string): Promise<void> {
        if (data.ticketId && Number(data.ticketId) === this.state.ticket.TicketID) {
            const tickets = await KIXObjectService.loadObjects<Ticket>(
                KIXObjectType.TICKET, [data.ticketId]
            );

            if (tickets && tickets.length) {
                this.state.ticket = tickets[0];
            }

            await this.prepareAvatar();
        }
    }

    private async prepareAvatar(): Promise<void> {
        const contacts = await KIXObjectService.loadObjects<Contact>(
            KIXObjectType.CONTACT, null, new KIXObjectLoadingOptions([
                new FilterCriteria(
                    ContactProperty.ASSIGNED_USER_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                    FilterType.AND, this.state.ticket.OwnerID
                )
            ])
        );

        if (Array.isArray(contacts) && contacts.length) {
            const avatars = await KIXObjectService.loadObjects<ObjectIcon>(
                KIXObjectType.OBJECT_ICON, null, null,
                new ObjectIconLoadingOptions(KIXObjectType.CONTACT, contacts[0].ID)
            ).catch((e): ObjectIcon[] => []);

            if (Array.isArray(avatars) && avatars.length) {
                this.state.avatar = avatars[0];
            } else {
                this.state.initials =
                    contacts[0].Firstname.substr(0, 1).toLocaleUpperCase() +
                    contacts[0].Lastname.substr(0, 1).toLocaleUpperCase();
            }

            this.state.contactTooltip = contacts[0].Fullname;

            this.state.userColor = BrowserUtil.getUserColor(this.state.ticket.OwnerID);
        }
    }

}

module.exports = Component;
