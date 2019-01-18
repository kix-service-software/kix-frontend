import { ILabelProvider } from "..";
import {
    Ticket, TicketProperty, DateTimeUtil, ObjectIcon,
    Customer, KIXObjectType, Contact, KIXObject, TicketPriority, TicketType,
    TicketState, Queue, SysConfigItem, SysConfigKey, Sla
} from "../../model";
import { ContextService } from "../context";
import { KIXObjectService } from "../kix";
import { SearchProperty } from "../SearchProperty";

export class TicketLabelProvider implements ILabelProvider<Ticket> {

    public kixObjectType: KIXObjectType = KIXObjectType.TICKET;

    public async getPropertyValueDisplayText(property: string, value: string | number): Promise<string> {
        let displayValue = value;
        const objectData = ContextService.getInstance().getObjectData();
        if (objectData) {
            switch (property) {
                case TicketProperty.QUEUE_ID:
                    const queues = await KIXObjectService.loadObjects<Queue>(
                        KIXObjectType.QUEUE, [value]
                    ).catch((error) => [] as Queue[]);
                    const queue = queues.find((q) => q.QueueID === value);
                    displayValue = queue ? queue.Name : value;
                    break;
                case TicketProperty.STATE_ID:
                    const states = await KIXObjectService.loadObjects<TicketState>(
                        KIXObjectType.TICKET_STATE, [value]
                    ).catch((error) => []);
                    displayValue = states && states.length ? states[0].Name : value;
                    break;
                case TicketProperty.PRIORITY_ID:
                    const priority = await KIXObjectService.loadObjects<TicketPriority>(
                        KIXObjectType.TICKET_PRIORITY, [value]
                    ).catch((error) => []);
                    displayValue = priority && priority.length ? priority[0].Name : value;
                    break;
                case TicketProperty.TYPE_ID:
                    const types = await KIXObjectService.loadObjects<TicketType>(
                        KIXObjectType.TICKET_TYPE, [value]
                    ).catch((error) => []);
                    displayValue = types && types.length ? types[0].Name : value;
                    break;
                case TicketProperty.SERVICE_ID:
                    const service = objectData.services.find((s) => s.ServiceID === value);
                    displayValue = service ? service.Name : value;
                    break;
                case TicketProperty.SLA_ID:
                    const slas = await KIXObjectService.loadObjects<Sla>(
                        KIXObjectType.SLA, [value]
                    ).catch((error) => []);
                    displayValue = slas && slas.length ? slas[0].Name : value;
                    break;
                default:
                    displayValue = value;
            }
        }

        return displayValue ? displayValue.toString() : '';
    }

    public async getPropertyText(property: string, object?: KIXObject, short?: boolean): Promise<string> {
        let displayValue = property;
        switch (property) {
            case SearchProperty.FULLTEXT:
                displayValue = 'Volltext';
                break;
            case TicketProperty.WATCHERS:
                displayValue = 'Beobachter';
                break;
            case TicketProperty.UNSEEN:
                displayValue = 'ungelesene Artikel';
                break;
            case TicketProperty.TITLE:
                displayValue = 'Titel';
                break;
            case TicketProperty.CHANGED:
                displayValue = 'Geändert am';
                break;
            case TicketProperty.TIME_UNITS:
                displayValue = 'Erfasste Zeit';
                break;
            case TicketProperty.CREATED:
            case TicketProperty.CREATE_TIME:
                displayValue = 'Erstellt am';
                break;
            case TicketProperty.LOCK_ID:
                displayValue = 'Sperrstatus';
                break;
            case TicketProperty.PRIORITY_ID:
                displayValue = short ? 'Prio' : 'Priorität';
                break;
            case TicketProperty.TYPE_ID:
                displayValue = 'Typ';
                break;
            case TicketProperty.QUEUE_ID:
                displayValue = 'Queue';
                break;
            case TicketProperty.STATE_ID:
                displayValue = 'Status';
                break;
            case TicketProperty.SERVICE_ID:
                displayValue = 'Service';
                break;
            case TicketProperty.SLA_ID:
                displayValue = 'SLA';
                break;
            case TicketProperty.OWNER_ID:
                displayValue = 'Bearbeiter';
                break;
            case TicketProperty.RESPONSIBLE_ID:
                displayValue = 'Verantwortlicher';
                break;
            case TicketProperty.CUSTOMER_ID:
                displayValue = 'Kunde';
                break;
            case TicketProperty.CUSTOMER_USER_ID:
                displayValue = 'Ansprechpartner';
                break;
            case TicketProperty.AGE:
                displayValue = 'Alter';
                break;
            case TicketProperty.PENDING_TIME:
                displayValue = 'Warten bis';
                break;
            case TicketProperty.TICKET_NUMBER:
                const hookConfig = await KIXObjectService.loadObjects<SysConfigItem>(
                    KIXObjectType.SYS_CONFIG_ITEM, [SysConfigKey.TICKET_HOOK]
                ).catch((error) => []);
                if (hookConfig && hookConfig.length) {
                    displayValue = hookConfig[0].Data;
                }
                break;
            case TicketProperty.ESCALATION_TIME:
                displayValue = 'Eskalationszeit';
                break;
            case TicketProperty.ESCALATION_RESPONSE_TIME:
                displayValue = 'Reaktionszeit';
                break;
            case TicketProperty.ESCALATION_UPDATE_TIME:
                displayValue = 'Aktualisierungszeit';
                break;
            case TicketProperty.ESCALATION_SOLUTIONS_TIME:
                displayValue = 'Lösungszeit';
                break;
            case TicketProperty.TICKET_FLAG:
                displayValue = 'Ticket Flags';
                break;
            case TicketProperty.CLOSE_TIME:
                displayValue = 'Schließzeit';
                break;
            case TicketProperty.CHANGE_TIME:
                displayValue = 'Änderungszeit';
                break;
            case TicketProperty.LAST_CHANGE_TIME:
                displayValue = 'Letzte Änderungszeit';
                break;
            case 'UserID':
                displayValue = 'Agent';
                break;
            case 'LinkedAs':
                displayValue = 'Verknüpft als';
                break;
            default:
                displayValue = property;
        }
        return displayValue;
    }

    public async getDisplayText(ticket: Ticket, property: string): Promise<string> {
        let displayValue = ticket[property];

        const objectData = ContextService.getInstance().getObjectData();

        switch (property) {
            case TicketProperty.CREATED:
                displayValue = DateTimeUtil.getLocalDateTimeString(displayValue);
                break;
            case TicketProperty.PENDING_TIME:
                displayValue = DateTimeUtil.getLocalDateTimeString(displayValue);
                break;
            case TicketProperty.CHANGED:
                displayValue = DateTimeUtil.getLocalDateTimeString(displayValue);
                break;
            case TicketProperty.PRIORITY_ID:
                displayValue = ticket.priority ? ticket.priority.Name : ticket.PriorityID;
                break;
            case TicketProperty.TYPE_ID:
                displayValue = ticket.type ? ticket.type.Name : ticket.TypeID;
                break;
            case TicketProperty.QUEUE_ID:
                displayValue = ticket.queue ? ticket.queue.Name : ticket.QueueID;
                break;
            case TicketProperty.STATE_ID:
                displayValue = ticket.state ? ticket.state.Name : ticket.StateID;
                break;
            case TicketProperty.SERVICE_ID:
                displayValue = ticket.service ? ticket.service.Name : ticket.ServiceID;
                break;
            case TicketProperty.SLA_ID:
                displayValue = ticket.sla ? ticket.sla.Name : ticket.SLAID;
                break;
            case TicketProperty.OWNER_ID:
                displayValue = ticket.owner ? ticket.owner.UserFullname : ticket.OwnerID;
                break;
            case TicketProperty.RESPONSIBLE_ID:
                displayValue = ticket.responsible ? ticket.responsible.UserFullname : ticket.ResponsibleID;
                break;
            case 'UserID':
                const user = objectData.users.find((u) => u.UserID === displayValue);
                if (user) {
                    displayValue = user.UserFullname;
                }
                break;
            case TicketProperty.CUSTOMER_ID:
                let customers;
                if (ticket.CustomerID) {
                    customers = await KIXObjectService.loadObjects<Customer>(
                        KIXObjectType.CUSTOMER, [ticket.CustomerID]
                    ).catch((error) => []);
                }
                displayValue = customers && customers.length
                    ? customers[0].CustomerCompanyName
                    : '';
                break;
            case TicketProperty.CUSTOMER_USER_ID:
                let contacts;
                if (ticket.CustomerUserID) {
                    contacts = await KIXObjectService.loadObjects<Contact>(
                        KIXObjectType.CONTACT, [ticket.CustomerUserID]
                    ).catch((error) => []);
                }
                displayValue = contacts && contacts.length
                    ? contacts[0].UserFirstname + ' ' + contacts[0].UserLastname
                    : '';
                break;
            case TicketProperty.AGE:
                displayValue = DateTimeUtil.calculateAge(displayValue);
                break;
            case TicketProperty.LOCK_ID:
                displayValue = ticket.LockID === 1 ? 'freigegeben' : 'gesperrt';
                break;
            case TicketProperty.ESCALATION_RESPONSE_TIME:
                displayValue = DateTimeUtil.getLocalDateTimeString(ticket.EscalationResponseTime);
                break;
            case TicketProperty.ESCALATION_UPDATE_TIME:
                displayValue = DateTimeUtil.getLocalDateTimeString(ticket.EscalationUpdateTime);
                break;
            case TicketProperty.ESCALATION_SOLUTIONS_TIME:
                displayValue = DateTimeUtil.getLocalDateTimeString(ticket.EscalationSolutionTime);
                break;
            case TicketProperty.WATCHERS:
                if (ticket.Watchers) {
                    const currentUser = objectData.currentUser;
                    displayValue = ticket.Watchers.some((w) => w.UserID === currentUser.UserID)
                        ? 'beaobachtet'
                        : '';
                }
                break;
            case TicketProperty.UNSEEN:
                displayValue = ticket.Unseen ? 'ungelesene Artikel' : '';
                break;
            default:
                displayValue = await this.getPropertyValueDisplayText(property, displayValue);
        }

        return displayValue ? displayValue.toString() : '';
    }

    public getDisplayTextClasses(ticket: Ticket, property: string): string[] {
        const classes = [];

        switch (property) {
            case TicketProperty.PENDING_TIME:
                if (ticket.isPendingReached()) {
                    classes.push('pending-time-reached');
                }
                break;
            case TicketProperty.UNSEEN:
                classes.push('unseen');
                break;
            default:
        }

        return classes;
    }

    public getObjectClasses(ticket: Ticket): string[] {
        const classes = [];
        if (ticket.Articles.some((a) => a.isUnread())) {
            classes.push('article-unread');
        }
        return classes;
    }

    public isLabelProviderFor(ticket: Ticket): boolean {
        return ticket instanceof Ticket;
    }

    public async getObjectText(ticket: Ticket, id: boolean = true, title: boolean = true): Promise<string> {
        let returnString = '';
        if (ticket) {
            if (id) {
                let ticketHook: string = '';
                let ticketHookDivider: string = '';

                const hookConfig = await KIXObjectService.loadObjects<SysConfigItem>(
                    KIXObjectType.SYS_CONFIG_ITEM, [SysConfigKey.TICKET_HOOK]
                ).catch((error) => []);
                const dividerConfig = await KIXObjectService.loadObjects<SysConfigItem>(
                    KIXObjectType.SYS_CONFIG_ITEM, [SysConfigKey.TICKET_HOOK_DIVIDER]
                ).catch((error) => []);

                if (hookConfig && hookConfig.length) {
                    ticketHook = hookConfig[0].Data;
                }

                if (dividerConfig && dividerConfig.length) {
                    ticketHookDivider = dividerConfig[0].Data;
                }

                returnString = ticketHook + ticketHookDivider + ticket.TicketNumber;
            }
            if (title) {
                returnString += (id ? " - " : '') + ticket.Title;
            }

        } else {
            returnString = 'Ticket';
        }
        return returnString;
    }

    public getObjectAdditionalText(ticket: Ticket): string {
        return null;
    }

    public getObjectIcon(ticket: Ticket): string | ObjectIcon {
        return 'kix-icon-ticket';
    }

    public getObjectTooltip(ticket: Ticket): string {
        return ticket.Title;
    }

    public getObjectName(plural: boolean = false): string {
        return plural ? "Tickets" : "Ticket";
    }

    public async getIcons(
        ticket: Ticket, property: string, value?: string | number
    ): Promise<Array<string | ObjectIcon>> {
        if (ticket) {
            value = ticket[property];
        }
        const icons = [];

        switch (property) {
            case TicketProperty.PRIORITY_ID:
                icons.push(new ObjectIcon('Priority', value));
                break;
            case TicketProperty.UNSEEN:
                if (ticket && ticket.Unseen === 1) {
                    icons.push('kix-icon-info');
                }
                break;
            case TicketProperty.TYPE_ID:
                icons.push(new ObjectIcon('TicketType', value));
                break;
            case TicketProperty.QUEUE_ID:
                icons.push(new ObjectIcon('Queue', value));
                break;
            case TicketProperty.STATE_ID:
                icons.push(new ObjectIcon('TicketState', value));
                break;
            case TicketProperty.SERVICE_ID:
                icons.push(new ObjectIcon(TicketProperty.SERVICE_ID, value));
                break;
            case TicketProperty.SLA_ID:
                icons.push(new ObjectIcon(TicketProperty.SLA_ID, value));
                break;
            case TicketProperty.LOCK_ID:
                value === 2
                    ? icons.push('kix-icon-lock-close')
                    : icons.push('kix-icon-lock-open');
                break;
            case TicketProperty.WATCHERS:
                if (ticket && ticket.Watchers) {
                    const objectData = ContextService.getInstance().getObjectData();
                    const user = objectData.currentUser;
                    if (ticket.Watchers.some((w) => w.UserID === user.UserID)) {
                        icons.push('kix-icon-eye');
                    }
                }
                break;
            default:
        }

        return icons;
    }

}
