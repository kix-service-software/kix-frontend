/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LabelProvider } from '../../../../modules/base-components/webapp/core/LabelProvider';
import { Ticket } from '../../model/Ticket';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { TicketProperty } from '../../model/TicketProperty';
import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { Queue } from '../../model/Queue';
import { TicketState } from '../../model/TicketState';
import { TicketPriority } from '../../model/TicketPriority';
import { TicketType } from '../../model/TicketType';
import { DateTimeUtil } from '../../../../modules/base-components/webapp/core/DateTimeUtil';
import { User } from '../../../user/model/User';
import { TranslationService } from '../../../../modules/translation/webapp/core/TranslationService';
import { SysConfigOption } from '../../../sysconfig/model/SysConfigOption';
import { SysConfigKey } from '../../../sysconfig/model/SysConfigKey';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { LabelService } from '../../../../modules/base-components/webapp/core/LabelService';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { UserProperty } from '../../../user/model/UserProperty';
import { StateType } from '../../model/StateType';
import { QueueProperty } from '../../model/QueueProperty';
import { AgentService } from '../../../user/webapp/core/AgentService';
import { Article } from '../../model/Article';
import { KIXObject } from '../../../../model/kix/KIXObject';

export class TicketLabelProvider extends LabelProvider<Ticket> {

    public kixObjectType: KIXObjectType = KIXObjectType.TICKET;

    public isLabelProviderFor(object: Ticket | KIXObject): boolean {
        return object instanceof Ticket || object?.KIXObjectType === this.kixObjectType;
    }

    public getSupportedProperties(): string[] {
        return [
            TicketProperty.CREATED_QUEUE_ID,
            TicketProperty.QUEUE_ID,
            TicketProperty.CREATED_STATE_ID,
            TicketProperty.STATE_ID,
            TicketProperty.STATE_TYPE,
            TicketProperty.STATE_TYPE_ID,
            TicketProperty.CREATED_PRIORITY_ID,
            TicketProperty.PRIORITY_ID,
            TicketProperty.CREATED_TYPE_ID,
            TicketProperty.TYPE_ID,
            TicketProperty.ORGANISATION_ID,
            TicketProperty.CONTACT_ID,
            TicketProperty.CREATED,
            TicketProperty.CHANGED,
            TicketProperty.PENDING_TIME,
            TicketProperty.CREATED_TIME_UNIX,
            TicketProperty.LOCK_ID,
            TicketProperty.CREATED_USER_ID,
            TicketProperty.OWNER_ID,
            TicketProperty.RESPONSIBLE_ID,
            TicketProperty.WATCHERS,
            TicketProperty.AGE,
            TicketProperty.UNSEEN,
            TicketProperty.ARCHIVE_FLAG,
            'Queue.FollowUpID'
        ];
    }

    public async getPropertyValueDisplayText(
        property: string, value: any, translatable: boolean = true
    ): Promise<string> {
        let displayValue = value;
        switch (property) {
            case TicketProperty.CREATED_QUEUE_ID:
            case TicketProperty.QUEUE_ID:
                if (value) {
                    const queues = await KIXObjectService.loadObjects<Queue>(
                        KIXObjectType.QUEUE, [value], null, null, true
                    ).catch((error) => [] as Queue[]);
                    const queue = queues.find((q) => q.QueueID.toString() === value.toString());
                    displayValue = queue ? queue.Name : value;
                }
                break;
            case TicketProperty.CREATED_STATE_ID:
            case TicketProperty.STATE_ID:
                if (value) {
                    const states = await KIXObjectService.loadObjects<TicketState>(
                        KIXObjectType.TICKET_STATE, [value], null, null, true
                    ).catch((error) => []);
                    displayValue = states && !!states.length ? states[0].Name : value;
                }
                break;
            case TicketProperty.STATE_TYPE:
            case TicketProperty.STATE_TYPE_ID:
                if (value) {
                    const stateTypes = await KIXObjectService.loadObjects<StateType>(
                        KIXObjectType.TICKET_STATE_TYPE, [value], null, null, true
                    ).catch((error) => []);
                    displayValue = stateTypes && !!stateTypes.length ? stateTypes[0].Name : value;
                }
                break;
            case TicketProperty.CREATED_PRIORITY_ID:
            case TicketProperty.PRIORITY_ID:
                if (value) {
                    const priority = await KIXObjectService.loadObjects<TicketPriority>(
                        KIXObjectType.TICKET_PRIORITY, [value], null, null, true
                    ).catch((error) => []);
                    displayValue = priority && !!priority.length ? priority[0].Name : value;
                }
                break;
            case TicketProperty.CREATED_TYPE_ID:
            case TicketProperty.TYPE_ID:
                if (value) {
                    const types = await KIXObjectService.loadObjects<TicketType>(
                        KIXObjectType.TICKET_TYPE, [value], null, null, true
                    ).catch((error) => []);
                    displayValue = types && !!types.length ? types[0].Name : value;
                }
                break;
            case TicketProperty.ORGANISATION_ID:
                if (value) {
                    let organisations;
                    if (!isNaN(Number(value))) {
                        organisations = await KIXObjectService.loadObjects(
                            KIXObjectType.ORGANISATION, [value], null, null, true, true, false
                        ).catch((error) => []);
                    }
                    displayValue = organisations && organisations.length
                        ? organisations[0].Name
                        : value;
                }
                break;
            case TicketProperty.CONTACT_ID:
                if (value) {
                    let contacts;
                    if (!isNaN(Number(value))) {
                        contacts = await KIXObjectService.loadObjects(
                            KIXObjectType.CONTACT, [value], null, null, true
                        ).catch((error) => []);
                    }
                    displayValue = contacts && contacts.length
                        ? contacts[0].Firstname + ' ' + contacts[0].Lastname
                        : value;
                }
                break;
            case TicketProperty.CREATED:
            case TicketProperty.CHANGED:
            case TicketProperty.PENDING_TIME:
                if (value) {
                    displayValue = translatable ?
                        await DateTimeUtil.getLocalDateTimeString(displayValue) : displayValue;
                }
                break;
            case TicketProperty.CREATED_TIME_UNIX:
                if (displayValue) {
                    displayValue = translatable
                        ? await DateTimeUtil.getLocalDateTimeString(Number(displayValue) * 1000)
                        : Number(displayValue) * 1000;
                }
                break;
            case TicketProperty.LOCK_ID:
                if (typeof value !== 'undefined') {
                    displayValue = value === 1 ? 'Translatable#Unlocked' : 'Translatable#Locked';
                }
                break;
            case TicketProperty.CREATED_USER_ID:
            case TicketProperty.OWNER_ID:
            case TicketProperty.RESPONSIBLE_ID:
                if (value) {
                    const users = await KIXObjectService.loadObjects<User>(
                        KIXObjectType.USER, [value],
                        new KIXObjectLoadingOptions(
                            null, null, 1, [UserProperty.CONTACT]
                        ), null, true, true, true
                    ).catch((error) => [] as User[]);
                    displayValue = users && users.length ?
                        users[0].Contact ? users[0].Contact.Fullname : users[0].UserLogin : value;
                }
                break;
            case TicketProperty.WATCHERS:
                if (value) {
                    const currentUser = await AgentService.getInstance().getCurrentUser();
                    displayValue = value.some((w) => w.UserID === currentUser.UserID)
                        ? 'Translatable#Watched'
                        : '';
                }
                break;
            case TicketProperty.AGE:
                if (value) {
                    displayValue = DateTimeUtil.calculateTimeInterval(Number(displayValue));
                }
                break;
            case TicketProperty.UNSEEN:
                displayValue = value ? 'Translatable#Unread Articles' : '';
                break;
            case TicketProperty.ARCHIVE_FLAG:
                displayValue = displayValue && displayValue === 'y' ? 'Translatable#Yes' : 'Translatable#No';
                break;
            case 'Queue.FollowUpID':
                const queueWithFollowUp = new Queue();
                queueWithFollowUp.FollowUpID = value;
                displayValue = await LabelService.getInstance().getDisplayText(
                    queueWithFollowUp, QueueProperty.FOLLOW_UP_ID
                );
                break;
            default:
                if (Article.isArticleProperty(property)) {
                    displayValue = await LabelService.getInstance().getPropertyValueDisplayText(
                        KIXObjectType.ARTICLE, property, value, false
                    );
                } else {
                    displayValue = await super.getPropertyValueDisplayText(property, value, translatable);
                }
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }
        return displayValue ? displayValue.toString() : '';
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case TicketProperty.WATCHERS:
                displayValue = 'Translatable#Observer';
                break;
            case TicketProperty.UNSEEN:
                displayValue = 'Translatable#Unread Articles';
                break;
            case TicketProperty.TITLE:
                displayValue = 'Translatable#Title';
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
            case TicketProperty.STATE_TYPE:
                displayValue = 'Translatable#Viewable States';
                break;
            case TicketProperty.STATE_TYPE_ID:
                displayValue = 'Translatable#State Type';
                break;
            case TicketProperty.SERVICE_ID:
                displayValue = 'Translatable#Service';
                break;
            case TicketProperty.OWNER_ID:
                displayValue = 'Translatable#Owner';
                break;
            case TicketProperty.RESPONSIBLE_ID:
                displayValue = 'Translatable#Responsible';
                break;
            case TicketProperty.ORGANISATION_ID:
                displayValue = 'Translatable#Organisation';
                break;
            case TicketProperty.CONTACT_ID:
                displayValue = 'Translatable#Contact';
                break;
            case TicketProperty.AGE:
                displayValue = 'Translatable#Age';
                break;
            case TicketProperty.PENDING_TIME:
                displayValue = 'Translatable#Pending until';
                break;
            case TicketProperty.TICKET_NUMBER:
                const hookConfig: SysConfigOption[] = await KIXObjectService.loadObjects<SysConfigOption>(
                    KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.TICKET_HOOK], null, null, true
                ).catch((error): SysConfigOption[] => []);
                if (hookConfig && hookConfig.length) {
                    displayValue = hookConfig[0].Value;
                }
                break;
            case TicketProperty.TICKET_FLAG:
                displayValue = 'Translatable#Ticket Flags';
                break;
            case TicketProperty.CLOSE_TIME:
                displayValue = 'Translatable#Closed at';
                break;
            case TicketProperty.LAST_CHANGE_TIME:
                displayValue = 'Translatable#Last changed time';
                break;
            case TicketProperty.ARCHIVE_FLAG:
                displayValue = 'Translatable#Archived';
                break;
            case 'Queue.FollowUpID':
                displayValue = await LabelService.getInstance().getPropertyText(
                    QueueProperty.FOLLOW_UP_ID, KIXObjectType.QUEUE
                );
                break;
            case 'UserID':
                displayValue = 'Translatable#Agent';
                break;
            case TicketProperty.CREATED_PRIORITY_ID:
                displayValue = 'Translatable#Created with Priority';
                break;
            case TicketProperty.CREATED_QUEUE_ID:
                displayValue = 'Translatable#Created with Queue';
                break;
            case TicketProperty.CREATED_STATE_ID:
                displayValue = 'Translatable#Created with State';
                break;
            case TicketProperty.CREATED_TYPE_ID:
                displayValue = 'Translatable#Created with Type';
                break;
            case TicketProperty.CREATED_USER_ID:
                displayValue = 'Translatable#Created with User';
                break;
            case TicketProperty.ARTICLE_CREATE_TIME:
                displayValue = 'Translatable#Article Create Time';
                break;
            case TicketProperty.ATTACHMENT_NAME:
                displayValue = 'Translatable#Attachment Name';
                break;
            case TicketProperty.WATCH_USER_ID:
                displayValue = 'Translatable#Watch User';
                break;
            default:
                if (Article.isArticleProperty(property)) {
                    displayValue = await LabelService.getInstance().getPropertyText(
                        property, KIXObjectType.ARTICLE, null, false
                    );
                } else {
                    displayValue = await super.getPropertyText(property, short, translatable);
                }
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue ? displayValue.toString() : '';
    }

    public async getPropertyIcon(property: string): Promise<string | ObjectIcon> {
        return;
    }

    public async getDisplayText(
        ticket: Ticket, property: string, defaultValue?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = typeof defaultValue !== 'undefined' && defaultValue !== null
            ? defaultValue
            : ticket[property];

        const existingValue = ticket.displayValues?.find((dv) => dv[0] === property);
        if (existingValue) {
            displayValue = existingValue[1];
        } else {

            switch (property) {
                case TicketProperty.CREATED_QUEUE_ID:
                    displayValue = await this.getPropertyValueDisplayText(
                        TicketProperty.QUEUE_ID, ticket.QueueID, translatable
                    );
                    break;
                case TicketProperty.CREATED_STATE_ID:
                    displayValue = await this.getPropertyValueDisplayText(
                        TicketProperty.STATE_ID, ticket.StateID, translatable
                    );
                    break;
                case TicketProperty.STATE_TYPE:
                    if (ticket.StateID) {
                        const states: TicketState[] = await KIXObjectService.loadObjects<TicketState>(
                            KIXObjectType.TICKET_STATE, [ticket.StateID], null, null, true
                        ).catch((error) => []);
                        displayValue = states && !!states.length ? states[0].TypeName : '';
                    }
                    break;
                case TicketProperty.CREATED_PRIORITY_ID:
                    displayValue = await this.getPropertyValueDisplayText(
                        TicketProperty.PRIORITY_ID, ticket.PriorityID, translatable
                    );
                    break;
                case TicketProperty.CREATED_TYPE_ID:
                    displayValue = await this.getPropertyValueDisplayText(
                        TicketProperty.TYPE_ID, ticket.TypeID, translatable
                    );
                    break;
                default:
                    displayValue = await super.getDisplayText(ticket, property, defaultValue, translatable);
            }
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
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

    public async getObjectText(
        ticket: Ticket, id: boolean = true, title: boolean = true, translatable: boolean = true
    ): Promise<string> {
        let returnString = '';
        if (ticket && ticket.Title) {
            if (id) {
                let ticketHook: string = '';
                let ticketHookDivider: string = '';

                const hookConfig = await KIXObjectService.loadObjects<SysConfigOption>(
                    KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.TICKET_HOOK]
                ).catch((error): SysConfigOption[] => []);
                const dividerConfig = await KIXObjectService.loadObjects<SysConfigOption>(
                    KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.TICKET_HOOK_DIVIDER]
                ).catch((error): SysConfigOption[] => []);

                if (hookConfig && hookConfig.length) {
                    ticketHook = hookConfig[0].Value ? hookConfig[0].Value : '';
                }

                if (dividerConfig && dividerConfig.length) {
                    ticketHookDivider = dividerConfig[0].Value ? dividerConfig[0].Value : '';
                }

                if (ticket.TicketNumber) {
                    returnString = ticketHook + ticketHookDivider + ticket.TicketNumber;
                }
            }
            if (title) {
                returnString += (id ? ' - ' : '') + ticket.Title;
            }

        }

        return returnString;
    }

    public getObjectAdditionalText(ticket: Ticket, translatable: boolean = true): string {
        return null;
    }

    public getObjectTypeIcon(): string | ObjectIcon {
        return 'kix-icon-ticket';
    }

    public async getObjectTooltip(ticket: Ticket, translatable: boolean = false): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(ticket.Title);
        }
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
            case TicketProperty.CREATED_PRIORITY_ID:
            case TicketProperty.PRIORITY_ID:
                if (value) {
                    icons.push(new ObjectIcon(null, 'Priority', value));
                }
                break;
            case TicketProperty.UNSEEN:
                if (ticket && ticket.Unseen === 1) {
                    icons.push('kix-icon-info');
                }
                break;
            case TicketProperty.CREATED_TYPE_ID:
            case TicketProperty.TYPE_ID:
                if (value) {
                    icons.push(new ObjectIcon(null, 'TicketType', value));
                }
                break;
            case TicketProperty.CONTACT_ID:
                if (ticket && ticket.ContactID) {
                    icons.push(new ObjectIcon(
                        null, KIXObjectType.CONTACT, ticket.ContactID, null, null,
                        LabelService.getInstance().getObjectTypeIcon(KIXObjectType.CONTACT)
                    ));
                }
                break;
            case TicketProperty.ORGANISATION_ID:
                if (ticket && ticket.OrganisationID) {
                    icons.push(new ObjectIcon(
                        null, KIXObjectType.ORGANISATION, ticket.OrganisationID, null, null,
                        LabelService.getInstance().getObjectTypeIcon(KIXObjectType.ORGANISATION)
                    ));
                }
                break;
            case TicketProperty.CREATED_USER_ID:
                if (value) {
                    const users = await KIXObjectService.loadObjects<User>(
                        KIXObjectType.USER, [value],
                        new KIXObjectLoadingOptions(
                            null, null, 1, [UserProperty.CONTACT]
                        ), null, true, true, true
                    ).catch((error) => [] as User[]);
                    if (Array.isArray(users) && users.length) {
                        icons.push(new ObjectIcon(
                            null, KIXObjectType.CONTACT, users[0].Contact.ID, null, null,
                            LabelService.getInstance().getObjectTypeIcon(KIXObjectType.USER))
                        );
                    }
                }
                break;
            case TicketProperty.OWNER_ID:
                if (ticket && ticket.OwnerID) {
                    const users = await KIXObjectService.loadObjects<User>(
                        KIXObjectType.USER, [ticket.OwnerID],
                        new KIXObjectLoadingOptions(
                            null, null, 1, [UserProperty.CONTACT]
                        ), null, true, true, true
                    ).catch((error) => [] as User[]);
                    if (Array.isArray(users) && users.length) {
                        icons.push(new ObjectIcon(
                            null, KIXObjectType.CONTACT, users[0].Contact.ID, null, null,
                            LabelService.getInstance().getObjectTypeIcon(KIXObjectType.USER))
                        );
                    }
                }
                break;
            case TicketProperty.RESPONSIBLE_ID:
                if (ticket && ticket.ResponsibleID) {
                    const users = await KIXObjectService.loadObjects<User>(
                        KIXObjectType.USER, [ticket.ResponsibleID],
                        new KIXObjectLoadingOptions(
                            null, null, 1, [UserProperty.CONTACT]
                        ), null, true, true, true
                    ).catch((error) => [] as User[]);
                    if (Array.isArray(users) && users.length) {
                        icons.push(new ObjectIcon(
                            null, KIXObjectType.CONTACT, users[0].Contact.ID, null, null,
                            LabelService.getInstance().getObjectTypeIcon(KIXObjectType.USER))
                        );
                    }
                }
                break;
            case TicketProperty.CREATED_QUEUE_ID:
            case TicketProperty.QUEUE_ID:
                if (value) {
                    icons.push(new ObjectIcon(null, 'Queue', value));
                }
                break;
            case TicketProperty.CREATED_STATE_ID:
            case TicketProperty.STATE_ID:
                if (value) {
                    icons.push(new ObjectIcon(null, 'TicketState', value));
                }
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

    public canShow(property: string, ticket: Ticket): boolean {
        switch (property) {
            case TicketProperty.STATE_ID:
            case TicketProperty.PRIORITY_ID:
            case TicketProperty.LOCK_ID:
            case TicketProperty.QUEUE_ID:
            case TicketProperty.ORGANISATION_ID:
            case TicketProperty.CONTACT_ID:
            case TicketProperty.RESPONSIBLE_ID:
            case TicketProperty.OWNER_ID:
            case TicketProperty.TYPE_ID:
            case TicketProperty.SERVICE_ID:
            case TicketProperty.ARTICLES:
            case TicketProperty.HISTORY:
            case TicketProperty.WATCHERS:
                return Object.prototype.hasOwnProperty.call(ticket, property);
            default:
                return true;
        }
    }

}
