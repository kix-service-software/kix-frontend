/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { FilterCriteria } from '../../../../../../model/FilterCriteria';
import { FilterDataType } from '../../../../../../model/FilterDataType';
import { FilterType } from '../../../../../../model/FilterType';
import { KIXObjectLoadingOptions } from '../../../../../../model/KIXObjectLoadingOptions';
import { ObjectIconLoadingOptions } from '../../../../../../server/model/ObjectIconLoadingOptions';
import { KIXObjectService } from '../../../../../base-components/webapp/core/KIXObjectService';
import { Contact } from '../../../../../customer/model/Contact';
import { ContactProperty } from '../../../../../customer/model/ContactProperty';
import { ObjectIcon } from '../../../../../icon/model/ObjectIcon';
import { SearchOperator } from '../../../../../search/model/SearchOperator';
import { BrowserUtil } from '../../../../../base-components/webapp/core/BrowserUtil';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.ticket = input.ticket;
        const config = input.calendarConfig;
        this.state.properties = Array.isArray(config?.properties)
            ? [...config.properties]
            : [];
        if (
            input.isPending && this.state.properties.length &&
            !this.state.properties.some((p) => p === TicketProperty.PENDING_TIME)
        ) {
            this.state.properties.push(TicketProperty.PENDING_TIME);
        }
    }

    public async onMount(): Promise<void> {
        this.state.title = this.state.ticket.Title;

        this.state.routingConfiguration = new RoutingConfiguration(
            'ticket-details', KIXObjectType.TICKET, ContextMode.DETAILS, null
        );

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

        await this.prepareAvatar();

        this.state.prepared = true;
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
