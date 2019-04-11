import { ILabelProvider } from "..";
import {
    Ticket, TicketProperty, DateTimeUtil, ObjectIcon,
    Customer, KIXObjectType, Contact, TicketPriority, TicketType,
    TicketState, Queue, SysConfigItem, SysConfigKey, Sla, User, Service
} from "../../model";
import { KIXObjectService } from "../kix";
import { SearchProperty } from "../SearchProperty";
import { TranslationService } from "../i18n/TranslationService";
import { AgentService } from "../application/AgentService";

export class TicketLabelProvider implements ILabelProvider<Ticket> {

    public kixObjectType: KIXObjectType = KIXObjectType.TICKET;

    public isLabelProviderForType(objectType: KIXObjectType): boolean {
        return objectType === this.kixObjectType;
    }

    public async getPropertyValueDisplayText(
        property: string, value: string | number, translatable: boolean = true
    ): Promise<string> {
        let displayValue = value;
        switch (property) {
            case TicketProperty.QUEUE_ID:
                const queues = await KIXObjectService.loadObjects<Queue>(
                    KIXObjectType.QUEUE, [value], null, null, true
                ).catch((error) => [] as Queue[]);
                const queue = queues.find((q) => q.QueueID.toString() === value.toString());
                displayValue = queue ? queue.Name : value;
                break;
            case TicketProperty.STATE_ID:
                const states = await KIXObjectService.loadObjects<TicketState>(
                    KIXObjectType.TICKET_STATE, [value], null, null, true
                ).catch((error) => []);
                displayValue = states && !!states.length ? states[0].Name : value;
                break;
            case TicketProperty.PRIORITY_ID:
                const priority = await KIXObjectService.loadObjects<TicketPriority>(
                    KIXObjectType.TICKET_PRIORITY, [value], null, null, true
                ).catch((error) => []);
                displayValue = priority && !!priority.length ? priority[0].Name : value;
                break;
            case TicketProperty.TYPE_ID:
                const types = await KIXObjectService.loadObjects<TicketType>(
                    KIXObjectType.TICKET_TYPE, [value], null, null, true
                ).catch((error) => []);
                displayValue = types && !!types.length ? types[0].Name : value;
                break;
            case TicketProperty.SERVICE_ID:
                const services = await KIXObjectService.loadObjects<Service>(
                    KIXObjectType.SERVICE, [value], null, null, true
                ).catch((error) => []);
                displayValue = services && !!services.length ? services[0].Name : value;
                break;
            case TicketProperty.SLA_ID:
                const slas = await KIXObjectService.loadObjects<Sla>(
                    KIXObjectType.SLA, [value], null, null, true
                ).catch((error) => []);
                displayValue = slas && !!slas.length ? slas[0].Name : value;
                break;
            case TicketProperty.LOCK_ID:
                displayValue = value === 1 ? 'Translatable#unlocked' : 'Translatable#locked';
                break;
            case TicketProperty.OWNER_ID:
            case TicketProperty.RESPONSIBLE_ID:
                const users = await KIXObjectService.loadObjects<User>(
                    KIXObjectType.USER, [value], null, null, true
                ).catch((error) => [] as User[]);
                displayValue = users && !!users.length ? users[0].UserFullname : value;
                break;
            default:
                displayValue = value;
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }
        return displayValue ? displayValue.toString() : '';
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case SearchProperty.FULLTEXT:
                displayValue = 'Translatable#Full Text';
                break;
            case TicketProperty.WATCHERS:
                displayValue = 'Translatable#Observer';
                break;
            case TicketProperty.UNSEEN:
                displayValue = 'Translatable#Unread Articles';
                break;
            case TicketProperty.TITLE:
                displayValue = 'Translatable#Title';
                break;
            case TicketProperty.CHANGED:
                displayValue = 'Translatable#Changed at';
                break;
            case TicketProperty.TIME_UNITS:
                displayValue = 'Translatable#accounted time';
                break;
            case TicketProperty.CREATED:
            case TicketProperty.CREATE_TIME:
                displayValue = 'Translatable#Created at';
                break;
            case TicketProperty.LOCK_ID:
                displayValue = 'Translatable#Lock State';
                break;
            case TicketProperty.PRIORITY_ID:
                displayValue = short ? 'Translatable#Prio' : 'Translatable#Priority';
                break;
            case TicketProperty.TYPE_ID:
                displayValue = 'Translatable#Type';
                break;
            case TicketProperty.QUEUE_ID:
                displayValue = 'Translatable#Queue';
                break;
            case TicketProperty.STATE_ID:
                displayValue = 'Translatable#State';
                break;
            case TicketProperty.SERVICE_ID:
                displayValue = 'Translatable#Service';
                break;
            case TicketProperty.SLA_ID:
                displayValue = 'Translatable#SLA';
                break;
            case TicketProperty.OWNER_ID:
                displayValue = 'Translatable#Owner';
                break;
            case TicketProperty.RESPONSIBLE_ID:
                displayValue = 'Translatable#Responsible';
                break;
            case TicketProperty.CUSTOMER_ID:
                displayValue = 'Translatable#Customer';
                break;
            case TicketProperty.CUSTOMER_USER_ID:
                displayValue = 'Translatable#Contact';
                break;
            case TicketProperty.AGE:
                displayValue = 'Translatable#Age';
                break;
            case TicketProperty.PENDING_TIME:
                displayValue = 'Translatable#pending until';
                break;
            case TicketProperty.TICKET_NUMBER:
                const hookConfig = await KIXObjectService.loadObjects<SysConfigItem>(
                    KIXObjectType.SYS_CONFIG_ITEM, [SysConfigKey.TICKET_HOOK], null, null, true
                ).catch((error) => []);
                if (hookConfig && hookConfig.length) {
                    displayValue = hookConfig[0].Data;
                }
                break;
            case TicketProperty.ESCALATION_TIME:
                displayValue = 'Translatable#Escalation time';
                break;
            case TicketProperty.ESCALATION_RESPONSE_TIME:
                displayValue = 'Translatable#Response time';
                break;
            case TicketProperty.ESCALATION_UPDATE_TIME:
                displayValue = 'Translatable#Update time';
                break;
            case TicketProperty.ESCALATION_SOLUTIONS_TIME:
                displayValue = 'Translatable#Solution time';
                break;
            case TicketProperty.TICKET_FLAG:
                displayValue = 'Translatable#Ticket Flags';
                break;
            case TicketProperty.CLOSE_TIME:
                displayValue = 'Translatable#Closing time';
                break;
            case TicketProperty.CHANGE_TIME:
                displayValue = 'Translatable#Changed at';
                break;
            case TicketProperty.LAST_CHANGE_TIME:
                displayValue = 'Translatable#last changed time';
                break;
            case 'UserID':
                displayValue = 'Translatable#Agent';
                break;
            case 'LinkedAs':
                displayValue = 'Translatable#Linked as';
                break;
            default:
                displayValue = property;
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue;
    }

    public async getPropertyIcon(property: string): Promise<string | ObjectIcon> {
        return;
    }

    public async getDisplayText(
        ticket: Ticket, property: string, defaultValue?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = ticket[property];

        switch (property) {
            case TicketProperty.CREATED:
                displayValue = await DateTimeUtil.getLocalDateTimeString(displayValue);
                break;
            case TicketProperty.PENDING_TIME:
                displayValue = await DateTimeUtil.getLocalDateTimeString(displayValue);
                break;
            case TicketProperty.CHANGED:
                displayValue = await DateTimeUtil.getLocalDateTimeString(displayValue);
                break;
            case TicketProperty.QUEUE_ID:
                if (ticket.QueueID) {
                    const queues = await KIXObjectService.loadObjects<Queue>(
                        KIXObjectType.QUEUE, [ticket.QueueID], null, null, true
                    ).catch((error) => [] as Queue[]);
                    const queue = queues.find((q) => q.QueueID.toString() === ticket.QueueID.toString());
                    displayValue = queue ? queue.Name : ticket.QueueID;
                }
                break;
            case TicketProperty.STATE_ID:
                if (ticket.StateID) {
                    const states = await KIXObjectService.loadObjects<TicketState>(
                        KIXObjectType.TICKET_STATE, [ticket.StateID], null, null, true
                    ).catch((error) => []);
                    displayValue = states && states.length ? states[0].Name : ticket.StateID;
                }
                break;
            case TicketProperty.PRIORITY_ID:
                if (ticket.PriorityID) {
                    const priority = await KIXObjectService.loadObjects<TicketPriority>(
                        KIXObjectType.TICKET_PRIORITY, [ticket.PriorityID], null, null, true
                    ).catch((error) => []);
                    displayValue = priority && priority.length ? priority[0].Name : ticket.PriorityID;
                }
                break;
            case TicketProperty.TYPE_ID:
                if (ticket.TypeID) {
                    const types = await KIXObjectService.loadObjects<TicketType>(
                        KIXObjectType.TICKET_TYPE, [ticket.TypeID], null, null, true
                    ).catch((error) => []);
                    displayValue = types && types.length ? types[0].Name : ticket.TypeID;
                }
                break;
            case TicketProperty.SERVICE_ID:
                if (ticket.ServiceID) {
                    const services = await KIXObjectService.loadObjects<Service>(
                        KIXObjectType.SERVICE, [ticket.ServiceID], null, null, true
                    ).catch((error) => []);
                    displayValue = services && services.length ? services[0].Name : ticket.ServiceID;
                }
                break;
            case TicketProperty.SLA_ID:
                if (ticket.SLAID) {
                    const slas = await KIXObjectService.loadObjects<Sla>(
                        KIXObjectType.SLA, [ticket.SLAID], null, null, true
                    ).catch((error) => []);
                    displayValue = slas && slas.length ? slas[0].Name : ticket.SLAID;
                }
                break;
            case 'UserID':
                const users = await KIXObjectService.loadObjects<User>(
                    KIXObjectType.USER, [displayValue], null, null, true
                ).catch((error) => [] as User[]);
                displayValue = users && !!users.length ? users[0].UserFullname : displayValue;
            case TicketProperty.CUSTOMER_ID:
                if (ticket.CustomerID) {
                    let customers;
                    if (ticket.CustomerID) {
                        customers = await KIXObjectService.loadObjects<Customer>(
                            KIXObjectType.CUSTOMER, [ticket.CustomerID], null, null, true
                        ).catch((error) => []);
                    }
                    displayValue = customers && customers.length
                        ? customers[0].CustomerCompanyName
                        : ticket.CustomerID;
                }
                break;
            case TicketProperty.CUSTOMER_USER_ID:
                let contacts;
                if (ticket.CustomerUserID) {
                    contacts = await KIXObjectService.loadObjects<Contact>(
                        KIXObjectType.CONTACT, [ticket.CustomerUserID], null, null, true
                    ).catch((error) => []);
                }
                displayValue = contacts && contacts.length
                    ? contacts[0].UserFirstname + ' ' + contacts[0].UserLastname
                    : ticket.CustomerUserID;
                break;
            case TicketProperty.AGE:
                displayValue = DateTimeUtil.calculateAge(displayValue);
                break;
            case TicketProperty.LOCK_ID:
                displayValue = ticket.LockID === 1 ? 'Unlocked' : 'Locked';
                break;
            case TicketProperty.ESCALATION_RESPONSE_TIME:
                displayValue = await DateTimeUtil.getLocalDateTimeString(ticket.EscalationResponseTime);
                break;
            case TicketProperty.ESCALATION_UPDATE_TIME:
                displayValue = await DateTimeUtil.getLocalDateTimeString(ticket.EscalationUpdateTime);
                break;
            case TicketProperty.ESCALATION_SOLUTIONS_TIME:
                displayValue = await DateTimeUtil.getLocalDateTimeString(ticket.EscalationSolutionTime);
                break;
            case TicketProperty.WATCHERS:
                if (ticket.Watchers) {
                    const currentUser = await AgentService.getInstance().getCurrentUser();
                    displayValue = ticket.Watchers.some((w) => w.UserID === currentUser.UserID)
                        ? 'watched'
                        : '';
                }
                break;
            case TicketProperty.UNSEEN:
                displayValue = ticket.Unseen ? 'Unread Articles' : '';
                break;
            default:
                displayValue = await this.getPropertyValueDisplayText(property, displayValue);
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
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

    public async getObjectText(
        ticket: Ticket, id: boolean = true, title: boolean = true, translatable: boolean = true
    ): Promise<string> {
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
            const ticketLabel = await TranslationService.translate('Translatable#Ticket');
            returnString = ticketLabel;
        }
        return returnString;
    }

    public getObjectAdditionalText(ticket: Ticket, translatable: boolean = true): string {
        return null;
    }

    public getObjectIcon(ticket: Ticket): string | ObjectIcon {
        return 'kix-icon-ticket';
    }

    public getObjectTooltip(ticket: Ticket, translatable: boolean = true): string {
        return ticket.Title;
    }

    public async getObjectName(plural: boolean = false, translatable: boolean = true): Promise<string> {
        if (plural) {
            const ticketsLabel = translatable ? await TranslationService.translate('Translatable#Tickets') : 'Tickets';
            return ticketsLabel;
        }

        const ticketLabel = translatable ? await TranslationService.translate('Translatable#Ticket') : 'Ticket';
        return ticketLabel;
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
                    const user = await AgentService.getInstance().getCurrentUser();
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
