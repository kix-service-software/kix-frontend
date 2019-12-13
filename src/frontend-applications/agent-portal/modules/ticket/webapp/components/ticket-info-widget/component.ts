/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from "./ComponentState";
import { RoutingConfiguration } from "../../../../../model/configuration/RoutingConfiguration";
import { IdService } from "../../../../../model/IdService";
import { TicketLabelProvider, TicketDetailsContext, TicketService } from "../../core";
import { ContextService } from "../../../../../modules/base-components/webapp/core/ContextService";
import { Ticket } from "../../../model/Ticket";
import { KIXObjectType } from "../../../../../model/kix/KIXObjectType";
import { SysConfigUtil } from "../../../../../modules/base-components/webapp/core/SysConfigUtil";
import { ActionFactory } from "../../../../../modules/base-components/webapp/core/ActionFactory";
import { KIXObjectService } from "../../../../../modules/base-components/webapp/core/KIXObjectService";
import { ObjectIcon } from "../../../../icon/model/ObjectIcon";
import { Context } from "vm";
import {
    ObjectInformationWidgetConfiguration
} from "../../../../../model/configuration/ObjectInformationWidgetConfiguration";
import { ContextMode } from "../../../../../model/ContextMode";

class Component {

    private state: ComponentState;
    private contextListernerId: string;

    public organisationRoutingConfiguration: RoutingConfiguration;
    public contactRoutingConfiguration: RoutingConfiguration;

    public onCreate(input: any): void {
        this.state = new ComponentState();
        this.contextListernerId = IdService.generateDateBasedId('ticket-info-');
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        this.state.labelProvider = new TicketLabelProvider();

        const context = await ContextService.getInstance().getContext<TicketDetailsContext>(
            TicketDetailsContext.CONTEXT_ID
        );

        context.registerListener(this.contextListernerId, {
            sidebarToggled: () => { (this as any).setStateDirty('ticket'); },
            explorerBarToggled: () => { (this as any).setStateDirty('ticket'); },
            objectListChanged: () => { return; },
            filteredObjectListChanged: () => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: async (ticketId: string, ticket: Ticket, type: KIXObjectType) => {
                if (type === KIXObjectType.TICKET) {
                    this.initWidget(ticket);
                }
            },
            additionalInformationChanged: () => { return; }
        });
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        await this.initWidget(await context.getObject<Ticket>());
        this.state.prepared = true;
    }

    private async initWidget(ticket: Ticket): Promise<void> {
        this.state.ticket = ticket;
        if (this.state.ticket) {
            this.state.isPending = await TicketService.getInstance().hasPendingState(this.state.ticket);
            this.state.isAccountTimeEnabled = await SysConfigUtil.isTimeAccountingEnabled();

            const context = await ContextService.getInstance().getContext<TicketDetailsContext>(
                TicketDetailsContext.CONTEXT_ID
            );

            this.initOrganisation(context);
            this.initContact(context);
        }

        this.setActions();
    }

    private async setActions(): Promise<void> {
        if (this.state.widgetConfiguration && this.state.ticket) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.state.ticket]
            );
        }
    }

    public getIcon(object: string, objectId: string): ObjectIcon {
        return new ObjectIcon(object, objectId);
    }

    private async initContact(context: Context): Promise<void> {
        const config = context ? context.getWidgetConfiguration('contact-info-overlay') : undefined;
        if (!isNaN(Number(this.state.ticket.ContactID))) {

            if (config && config.configuration) {
                const contacts = await KIXObjectService.loadObjects(
                    KIXObjectType.CONTACT, [this.state.ticket.ContactID]
                );
                this.state.contact = contacts && contacts.length ? contacts[0] : null;

                const settings = config.configuration as ObjectInformationWidgetConfiguration;
                this.state.contactProperties = settings.properties;
            }

            this.contactRoutingConfiguration = await this.getContactRoutingConfiguration();
        }
    }

    private async initOrganisation(context: Context): Promise<void> {
        const config = context ? context.getWidgetConfiguration('organisation-info-overlay') : undefined;
        if (!isNaN(Number(this.state.ticket.OrganisationID))) {

            if (config && config.configuration) {
                const organisation = await KIXObjectService.loadObjects(
                    KIXObjectType.ORGANISATION, [this.state.ticket.OrganisationID]
                );
                this.state.organisation = organisation && organisation.length ? organisation[0] : null;

                const settings = config.configuration as ObjectInformationWidgetConfiguration;
                this.state.organisationProperties = settings.properties;
            }

            this.organisationRoutingConfiguration = await this.getOrganisationRoutingConfiguration();
        }
    }

    private async getContactRoutingConfiguration(): Promise<RoutingConfiguration> {
        // FIXME: ask correct service for object routing configuration
        return new RoutingConfiguration(
            'contact-details', KIXObjectType.CONTACT,
            ContextMode.DETAILS, 'ID', false
        );
    }

    private async getOrganisationRoutingConfiguration(): Promise<RoutingConfiguration> {
        // FIXME: ask correct service for object routing configuration
        return new RoutingConfiguration(
            'organisation-details', KIXObjectType.ORGANISATION,
            ContextMode.DETAILS, 'ID', false
        );
    }

}

module.exports = Component;
