import { ComponentState } from './ComponentState';
import { TicketLabelProvider, TicketService, TicketDetailsContext } from "../../../../core/browser/ticket";
import { ContextService } from '../../../../core/browser/context';
import {
    ObjectIcon, KIXObjectType, Ticket, SysconfigUtil, ContextMode, OrganisationProperty,
    ContactProperty, Service, ObjectinformationWidgetSettings, Contact, Organisation, Context
} from '../../../../core/model';
import { ActionFactory, IdService, KIXObjectService } from '../../../../core/browser';
import { RoutingConfiguration } from '../../../../core/browser/router';
import { ContactDetailsContext } from '../../../../core/browser/contact';
import { OrganisationDetailsContext } from '../../../../core/browser/organisation';

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
            }
        });
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        await this.initWidget(await context.getObject<Ticket>());
    }

    private async initWidget(ticket: Ticket): Promise<void> {
        this.state.ticket = ticket;
        if (this.state.ticket) {
            this.state.isPending = await TicketService.getInstance().hasPendingState(this.state.ticket);
            this.state.isAccountTimeEnabled = await SysconfigUtil.isTimeAccountingEnabled();

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

    public async getIncidentStateId(): Promise<number> {
        const serviceId = this.state.ticket.ServiceID;
        let incidentStateId = 0;
        const services = await KIXObjectService.loadObjects<Service>(KIXObjectType.SERVICE, [serviceId]);
        const service = services.find((s) => s.ServiceID === serviceId);
        if (service) {
            incidentStateId = service.IncidentState.CurInciStateID;
        }

        return incidentStateId;
    }

    public getIcon(object: string, objectId: string): ObjectIcon {
        return new ObjectIcon(object, objectId);
    }

    private async initContact(context: Context): Promise<void> {
        const config = context ? context.getWidgetConfiguration('contact-info-overlay') : undefined;
        if (config && config.settings && !isNaN(Number(this.state.ticket.ContactID))) {

            const contacts = await KIXObjectService.loadObjects<Contact>(
                KIXObjectType.CONTACT, [this.state.ticket.ContactID]
            );
            this.state.contact = contacts && contacts.length ? contacts[0] : null;

            const settings = config.settings as ObjectinformationWidgetSettings;
            this.state.contactProperties = settings.properties;

            this.contactRoutingConfiguration = await this.getContactRoutingConfiguration();
        }
    }

    private async initOrganisation(context: Context): Promise<void> {
        const config = context ? context.getWidgetConfiguration('organisation-info-overlay') : undefined;
        if (config && config.settings && !isNaN(Number(this.state.ticket.OrganisationID))) {

            const organisation = await KIXObjectService.loadObjects<Organisation>(
                KIXObjectType.ORGANISATION, [this.state.ticket.OrganisationID]
            );
            this.state.organisation = organisation && organisation.length ? organisation[0] : null;

            const settings = config.settings as ObjectinformationWidgetSettings;
            this.state.organisationProperties = settings.properties;

            this.organisationRoutingConfiguration = await this.getOrganisationRoutingConfiguration();
        }
    }

    private async getContactRoutingConfiguration(): Promise<RoutingConfiguration> {
        return new RoutingConfiguration(
            ContactDetailsContext.CONTEXT_ID, KIXObjectType.CONTACT,
            ContextMode.DETAILS, ContactProperty.ID, false
        );
    }

    private async getOrganisationRoutingConfiguration(): Promise<RoutingConfiguration> {
        return new RoutingConfiguration(
            OrganisationDetailsContext.CONTEXT_ID, KIXObjectType.ORGANISATION,
            ContextMode.DETAILS, OrganisationProperty.ID, false
        );
    }

}

module.exports = Component;
