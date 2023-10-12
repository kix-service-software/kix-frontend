/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../model/KIXObjectLoadingOptions';
import { DateTimeAPIUtil } from '../../../server/services/DateTimeAPIUtil';
import { KIXObjectInitializer } from '../../../server/services/KIXObjectInitializer';
import { Organisation } from '../../customer/model/Organisation';
import { ContactAPIService } from '../../customer/server/ContactService';
import { OrganisationAPIService } from '../../customer/server/OrganisationService';
import { ObjectIcon } from '../../icon/model/ObjectIcon';
import { User } from '../../user/model/User';
import { UserProperty } from '../../user/model/UserProperty';
import { UserService } from '../../user/server/UserService';
import { Article } from '../model/Article';
import { Queue } from '../model/Queue';
import { StateType } from '../model/StateType';
import { Ticket } from '../model/Ticket';
import { TicketPriority } from '../model/TicketPriority';
import { TicketProperty } from '../model/TicketProperty';
import { TicketState } from '../model/TicketState';
import { TicketType } from '../model/TicketType';
import { ArticleLabelProvider } from './ArticleLabelProvider';
import { QueueAPIService } from './QueueService';
import { TicketPriorityAPIService } from './TicketPriorityService';
import { TicketAPIService } from './TicketService';
import { TicketStateAPIService } from './TicketStateService';
import { TicketTypeAPIService } from './TicketTypeService';

export class TicketLabelProvider {

    public static async getPropertyValue(token: string, object: Ticket | Article, property: string): Promise<string> {
        let displayValue: string;
        if (!Object.prototype.hasOwnProperty.call(object, property)) {
            return displayValue;
        }

        const ticket = object as Ticket;
        const objectValue = object[property];

        switch (property) {
            case TicketProperty.CREATED_QUEUE_ID:
            case TicketProperty.QUEUE_ID:
                if (ticket.Queue) {
                    displayValue = ticket.Queue.Name;
                } else {
                    const queues = await QueueAPIService.getInstance().loadObjects<Queue>(
                        token, 'TicketService', KIXObjectType.QUEUE, [objectValue], null, null
                    ).catch(() => [] as Queue[]);
                    displayValue = Array.isArray(queues) && queues.length ? queues[0].Name : displayValue;
                }
                break;
            case TicketProperty.CREATED_STATE_ID:
            case TicketProperty.STATE_ID:
                if (ticket.State) {
                    displayValue = ticket.State.Name;
                } else {
                    const states = await TicketStateAPIService.getInstance().loadObjects<TicketState>(
                        token, 'TicketService', KIXObjectType.TICKET_STATE, [objectValue], null, null
                    ).catch(() => []);
                    displayValue = Array.isArray(states) && states.length ? states[0].Name : displayValue;
                }
                break;
            case TicketProperty.STATE_TYPE_ID:
                const stateTypes = await TicketStateAPIService.getInstance().loadObjects<StateType>(
                    token, 'TicketService', KIXObjectType.TICKET_STATE_TYPE, [objectValue], null, null,
                ).catch(() => []);
                displayValue = Array.isArray(stateTypes) && stateTypes.length ? stateTypes[0].Name : displayValue;
                break;
            case TicketProperty.CREATED_PRIORITY_ID:
            case TicketProperty.PRIORITY_ID:
                if (ticket.Priority) {
                    displayValue = ticket.Priority.Name;
                } else {
                    const priority = await TicketPriorityAPIService.getInstance().loadObjects<TicketPriority>(
                        token, 'TicketService', KIXObjectType.TICKET_PRIORITY, [objectValue], null, null
                    ).catch(() => []);
                    displayValue = Array.isArray(priority) && priority.length ? priority[0].Name : displayValue;
                }
                break;
            case TicketProperty.CREATED_TYPE_ID:
            case TicketProperty.TYPE_ID:
                if (ticket.Type) {
                    displayValue = ticket.Type.Name;
                } else {
                    const types = await TicketTypeAPIService.getInstance().loadObjects<TicketType>(
                        token, 'TicketService', KIXObjectType.TICKET_TYPE, [objectValue], null, null
                    ).catch(() => []);
                    displayValue = Array.isArray(types) && types.length ? types[0].Name : displayValue;
                }
                break;
            case TicketProperty.ORGANISATION_ID:
                if (ticket.Organisation) {
                    displayValue = ticket.Organisation.Name;
                } else {
                    const organisations = await OrganisationAPIService.getInstance().loadObjects<Organisation>(
                        token, 'TicketService', KIXObjectType.ORGANISATION, [objectValue], null
                    ).catch(() => []);
                    displayValue = Array.isArray(organisations) && organisations.length
                        ? organisations[0].Name
                        : displayValue;
                }
                break;
            case TicketProperty.CONTACT_ID:
                if (ticket.Contact) {
                    displayValue = `${ticket.Contact.Firstname} ${ticket.Contact.Lastname}`;
                } else {
                    const contacts = await ContactAPIService.getInstance().loadObjects(
                        token, 'TicketService', KIXObjectType.CONTACT, [objectValue], null
                    ).catch(() => []);
                    displayValue = Array.isArray(contacts) && contacts.length
                        ? `${contacts[0].Firstname} ${contacts[0].Lastname}`
                        : displayValue;
                }
                break;
            case TicketProperty.CREATED:
            case TicketProperty.CHANGED:
            case TicketProperty.PENDING_TIME:
                displayValue = await DateTimeAPIUtil.getLocalDateTimeString(token, objectValue);
                break;
            case TicketProperty.CREATED_TIME_UNIX:
                displayValue = await DateTimeAPIUtil.getLocalDateTimeString(token, Number(displayValue) * 1000);
                break;
            case TicketProperty.LOCK_ID:
                displayValue = objectValue === 1 ? 'Unlocked' : 'Locked';
                break;
            case TicketProperty.CREATED_USER_ID:
                displayValue = await this.getUserDisplayValue(token, objectValue);
                break;
            case TicketProperty.OWNER_ID:
                if (ticket.Owner) {
                    displayValue = ticket.Owner.UserFullname;
                } else {
                    displayValue = await this.getUserDisplayValue(token, objectValue);
                }
                break;
            case TicketProperty.RESPONSIBLE_ID:
                if (ticket.Responsible) {
                    displayValue = ticket.Responsible.UserFullname;
                } else {
                    displayValue = await this.getUserDisplayValue(token, objectValue);
                }
                break;
            case TicketProperty.WATCHERS:
                displayValue = ticket.WatcherID > 0
                    ? 'Translatable#Watched'
                    : '';
                break;
            case TicketProperty.AGE:
                displayValue = DateTimeAPIUtil.calculateTimeInterval(Number(objectValue));
                break;
            case TicketProperty.UNSEEN:
                displayValue = objectValue ? 'Translatable#Unread Articles' : '';
                break;
            case TicketProperty.TITLE:
            case TicketProperty.TICKET_NUMBER:
                displayValue = objectValue;
                break;
            default:
                if (Article.isArticleProperty(property)) {
                    displayValue = await ArticleLabelProvider.getPropertyValue(token, object as Article, property);
                }
        }

        return displayValue;
    }

    public static async getPropertyIcons(
        token: string, object: Ticket | Article, property: string
    ): Promise<Array<ObjectIcon | string>> {
        let icons: Array<ObjectIcon | string>;

        if (!Object.prototype.hasOwnProperty.call(object, property)) {
            return icons;
        }

        const objectValue = object[property];

        switch (property) {
            case TicketProperty.CREATED_PRIORITY_ID:
            case TicketProperty.PRIORITY_ID:
                icons = [new ObjectIcon(null, 'Priority', objectValue)];
                break;
            case TicketProperty.UNSEEN:
                if (object && object[TicketProperty.UNSEEN] === 1) {
                    icons = ['kix-icon-info'];
                }
                break;
            case TicketProperty.CREATED_TYPE_ID:
            case TicketProperty.TYPE_ID:
                icons = [new ObjectIcon(null, 'TicketType', objectValue)];
                break;
            case TicketProperty.CONTACT_ID:
                icons = [
                    new ObjectIcon(
                        null, KIXObjectType.CONTACT, object[TicketProperty.CONTACT_ID],
                        null, null, 'kix-icon-man-bubble'
                    )
                ];
                break;
            case TicketProperty.ORGANISATION_ID:
                icons = [
                    new ObjectIcon(
                        null, KIXObjectType.ORGANISATION, object[TicketProperty.ORGANISATION_ID],
                        null, null, 'kix-icon-man-house'
                    )
                ];
                break;
            case TicketProperty.CREATED_USER_ID:
                icons = await this.getUserIcons(token, objectValue);
                break;
            case TicketProperty.OWNER_ID:
                icons = await this.getUserIcons(token, object[TicketProperty.OWNER_ID]);
                break;
            case TicketProperty.RESPONSIBLE_ID:
                icons = await this.getUserIcons(token, object[TicketProperty.RESPONSIBLE_ID]);
                break;
            case TicketProperty.CREATED_QUEUE_ID:
            case TicketProperty.QUEUE_ID:
                icons = [new ObjectIcon(null, 'Queue', objectValue)];
                break;
            case TicketProperty.CREATED_STATE_ID:
            case TicketProperty.STATE_ID:
                icons = [new ObjectIcon(null, 'TicketState', objectValue)];
                break;
            case TicketProperty.LOCK_ID:
                objectValue === 2
                    ? icons = ['kix-icon-lock-close']
                    : icons = ['kix-icon-lock-open'];
                break;
            case TicketProperty.WATCHERS:
                if ((object as Ticket).WatcherID > 0) {
                    icons = ['kix-icon-eye'];
                }
                break;
            case TicketProperty.ARTICLES:
                await KIXObjectInitializer.initDisplayValuesAndIcons(
                    token, object[TicketProperty.ARTICLES], TicketAPIService.getInstance()
                );
                break;
            default:
                if (Article.isArticleProperty(property)) {
                    icons = await ArticleLabelProvider.getPropertyIcons(token, object as Article, property);
                }
        }

        return icons;
    }

    private static async getUserIcons(token: string, userId: number): Promise<Array<ObjectIcon | string>> {
        let icons: Array<ObjectIcon | string>;
        const users = await UserService.getInstance().loadObjects<User>(
            token, 'TicketService', KIXObjectType.USER, [userId],
            new KIXObjectLoadingOptions(null, null, 1, [UserProperty.CONTACT]), null
        ).catch(() => [] as User[]);

        if (Array.isArray(users) && users.length) {
            icons = [new ObjectIcon(null, KIXObjectType.CONTACT, users[0].Contact.ID, null, null, 'kix-icon-man-bubble')];
        }

        return icons;
    }

    private static async getUserDisplayValue(token: string, userId: number): Promise<string> {
        const users = await UserService.getInstance().loadObjects<User>(
            token, 'TicketService', KIXObjectType.USER, [userId],
            new KIXObjectLoadingOptions(null, null, 1, [UserProperty.CONTACT]), null
        ).catch(() => []);
        const displayValue = Array.isArray(users) && users.length
            ? users[0].Contact ? users[0].Contact.Fullname : users[0].UserLogin
            : undefined;

        return displayValue;
    }
}