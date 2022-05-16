/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LabelProvider } from '../../../../modules/base-components/webapp/core/LabelProvider';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { NotificationProperty } from '../../model/NotificationProperty';
import { TranslationService } from '../../../../modules/translation/webapp/core/TranslationService';
import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { User } from '../../../user/model/User';
import { LabelService } from '../../../../modules/base-components/webapp/core/LabelService';
import { Role } from '../../../user/model/Role';
import { NotificationRecipientTypes } from '../../model/NotificationRecipientTypes';
import { Contact } from '../../../customer/model/Contact';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../../../model/FilterCriteria';
import { ContactProperty } from '../../../customer/model/ContactProperty';
import { SearchOperator } from '../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../model/FilterDataType';
import { FilterType } from '../../../../model/FilterType';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { Notification } from '../../model/Notification';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { NotificationConfig } from '../../model/NotificationConfig';


export class NotificationLabelProvider extends LabelProvider {

    public kixObjectType: KIXObjectType = KIXObjectType.NOTIFICATION;

    public isLabelProviderFor(object: KIXObject): boolean {
        return object instanceof Notification || object?.KIXObjectType === this.kixObjectType;
    }

    public async getObjectText(
        notification: Notification, id?: boolean, title?: boolean, translatable?: boolean
    ): Promise<string> {
        return notification.Name;
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue;
        switch (property) {
            case NotificationProperty.NAME:
                displayValue = 'Translatable#Name';
                break;
            case NotificationProperty.MESSAGE_SUBJECT:
                displayValue = 'Translatable#Subject';
                break;
            case NotificationProperty.MESSAGE_CONTENTTYPE:
                displayValue = 'Translatable#ContentType';
                break;
            case NotificationProperty.MESSAGE_BODY:
                displayValue = 'Translatable#Text';
                break;
            case NotificationProperty.DATA_RECIPIENTS:
                displayValue = 'Translatable#Send to';
                break;
            case NotificationProperty.DATA_RECIPIENT_AGENTS:
                displayValue = 'Translatable#Send to these agents';
                break;
            case NotificationProperty.DATA_RECIPIENT_ROLES:
                displayValue = 'Translatable#Send to all role members';
                break;
            case NotificationProperty.DATA_SEND_DESPITE_OOO:
                displayValue = 'Translatable#Send despite out of office';
                break;
            case NotificationProperty.DATA_SEND_ONCE_A_DAY:
                displayValue = 'Translatable#Once per day';
                break;
            case NotificationProperty.DATA_CREATE_ARTICLE:
                displayValue = 'Translatable#Create Article';
                break;
            case NotificationProperty.DATA_RECIPIENT_EMAIL:
                displayValue = 'Translatable#Additional recipients';
                break;
            case NotificationProperty.DATA_RECIPIENT_SUBJECT:
                displayValue = 'Translatable#Subject with Ticketnumber';
                break;
            case NotificationProperty.DATA_VISIBLE_FOR_AGENT:
                displayValue = 'Translatable#Show in agent preferences';
                break;
            case NotificationProperty.DATA_VISIBLE_FOR_AGENT_TOOLTIP:
                displayValue = 'Translatable#Agent Preferences Tooltip';
                break;
            default:
                displayValue = await super.getPropertyText(property, false, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue;
    }

    public async getPropertyValueDisplayText(
        property: string, value: any, translatable: boolean = true
    ): Promise<string> {
        let displayValue = value;
        switch (property) {
            case NotificationProperty.DATA_RECIPIENTS:
                if (value && Array.isArray(value)) {
                    const values: string[] = await this.getRecipientStrings(value, translatable);
                    displayValue = values.join(', ');
                }
                break;
            case NotificationProperty.DATA_RECIPIENT_EMAIL:
                if (value && Array.isArray(value)) {
                    const mailAddresses: string[] = [];
                    for (const email of value) {
                        const contact = await this.getContactForEmail(email);
                        if (contact) {
                            mailAddresses.push(
                                `${contact.Firstname} ${contact.Lastname} (${contact.Email})`
                            );
                        } else {
                            mailAddresses.push(email);
                        }
                    }
                    displayValue = mailAddresses.join(', ');
                    translatable = false;
                }
                break;
            case NotificationProperty.DATA_EVENTS:
                if (value && Array.isArray(value)) {
                    displayValue = value.join(', ');
                    translatable = false;
                }
                break;
            case NotificationProperty.DATA_RECIPIENT_AGENTS:
                if (value && Array.isArray(value)) {
                    const users = await KIXObjectService.loadObjects<User>(
                        KIXObjectType.USER, value, null, null, true, true, true
                    ).catch((error) => [] as User[]);
                    const displayTexts = [];
                    if (users && !!users.length) {
                        for (const user of users) {
                            const text = await LabelService.getInstance().getObjectText(user);
                            displayTexts.push(text);
                        }
                    }
                    displayValue = displayTexts.length ? displayTexts.join(', ') : value;
                    translatable = false;
                }
                break;
            case NotificationProperty.DATA_RECIPIENT_ROLES:
                if (value && Array.isArray(value)) {
                    const roles = await KIXObjectService.loadObjects<Role>(
                        KIXObjectType.ROLE, value, null, null, true
                    ).catch((error) => [] as Role[]);
                    const displayTexts = [];
                    if (roles && !!roles.length) {
                        for (const role of roles) {
                            const text = await LabelService.getInstance().getObjectText(role);
                            displayTexts.push(text);
                        }
                    }
                    displayValue = displayTexts.length ? displayTexts.join(', ') : value;
                    translatable = false;
                }
                break;
            case NotificationProperty.DATA_RECIPIENT_SUBJECT:
            case NotificationProperty.DATA_SEND_DESPITE_OOO:
            case NotificationProperty.DATA_SEND_ONCE_A_DAY:
            case NotificationProperty.DATA_VISIBLE_FOR_AGENT:
            case NotificationProperty.DATA_CREATE_ARTICLE:
                displayValue = value ? 'Translatable#Yes' : 'Translatable#No';
                break;
            case NotificationProperty.NAME:
            case NotificationProperty.DATA_VISIBLE_FOR_AGENT_TOOLTIP:
            case NotificationProperty.MESSAGE_SUBJECT:
                displayValue = value;
                translatable = false;
                break;
            case NotificationProperty.MESSAGE_CONTENTTYPE:
                displayValue = NotificationConfig.getContentType().filter((v) => v.key === value)[0].label;
                translatable = true;
                break;
            default:
                displayValue = await super.getPropertyValueDisplayText(property, value, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }
        return displayValue ? displayValue.toString() : '';
    }

    private async getRecipientStrings(value: any, translatable?: boolean): Promise<string[]> {
        const values: string[] = [];
        for (const v of value) {
            let displayString = '';
            switch (v) {
                case NotificationRecipientTypes.AGENT_RESPONSIBLE:
                    displayString = 'Translatable#TicketResponsible';
                    break;
                case NotificationRecipientTypes.AGENT_READ_PERMISSIONS:
                    displayString = 'Translatable#All agents with read permissions for the ticket';
                    break;
                case NotificationRecipientTypes.AGENT_WRITE_PERMISSIONS:
                    displayString = 'Translatable#All agents with update permission for the ticket';
                    break;
                case NotificationRecipientTypes.AGENT_MY_QUEUES:
                    displayString = 'Translatable#All agents subscribed to the tickets queue';
                    break;
                case NotificationRecipientTypes.CUSTOMER:
                    displayString = 'Translatable#Contact';
                    break;
                case NotificationRecipientTypes.AGENT_OWNER:
                    displayString = 'Translatable#Owner';
                    break;
                case NotificationRecipientTypes.AGENT_WATCHER:
                    displayString = 'Translatable#All agents watching this ticket';
                    break;
                default:
            }
            if (displayString) {
                displayString = await TranslationService.translate(
                    displayString, undefined, undefined, !translatable
                );
                values.push(displayString);
            }
        }
        return values;
    }

    private async getContactForEmail(email): Promise<Contact> {
        let contacts;
        if (email) {
            const plainMail = email.replace(/.+ [<\(](.+)[>\)]/, '$1');
            contacts = await KIXObjectService.loadObjects<Contact>(KIXObjectType.CONTACT, null,
                new KIXObjectLoadingOptions(
                    [
                        new FilterCriteria(
                            ContactProperty.EMAIL, SearchOperator.EQUALS, FilterDataType.STRING,
                            FilterType.OR, plainMail
                        )
                    ]

                ), null, true
            );
        }
        return contacts && !!contacts.length ? contacts[0] : null;
    }

    public async getPropertyIcon(property: string): Promise<string | ObjectIcon> {
        let icon;

        switch (property) {
            case NotificationProperty.DATA_RECIPIENT_ROLES:
                icon = LabelService.getInstance().getObjectTypeIcon(KIXObjectType.ROLE);
                break;
            case NotificationProperty.DATA_RECIPIENT_AGENTS:
                icon = LabelService.getInstance().getObjectTypeIcon(KIXObjectType.USER);
                break;
            default:
        }

        return icon;
    }

    public async getIcons(
        notification: Notification, property: string, value?: string | number
    ): Promise<Array<string | ObjectIcon>> {
        if (notification) {
            value = notification[property];
        }
        const icons = [];

        switch (property) {
            case NotificationProperty.DATA_RECIPIENT_ROLES:
                icons.push(LabelService.getInstance().getObjectTypeIcon(KIXObjectType.ROLE));
                break;
            case NotificationProperty.DATA_RECIPIENT_AGENTS:
                icons.push(LabelService.getInstance().getObjectTypeIcon(KIXObjectType.USER));
                break;
            case NotificationProperty.DATA_RECIPIENT_EMAIL:
                const contact = await this.getContactForEmail(Array.isArray(value) ? value[0] : value);
                if (contact) {
                    icons.push(LabelService.getInstance().getObjectTypeIcon(KIXObjectType.CONTACT));
                }
                break;
            default:
        }

        return icons;
    }

    public async getPropertyValues(property: string, value: any): Promise<string[]> {
        let values = [];
        switch (property) {
            case NotificationProperty.DATA_RECIPIENTS:
                if (value && Array.isArray(value)) {
                    values = await this.getRecipientStrings(value, true);
                }
                break;
            case NotificationProperty.DATA_RECIPIENT_EMAIL:
                if (value && Array.isArray(value)) {
                    for (const email of value) {
                        const contact = await this.getContactForEmail(email);
                        if (contact) {
                            values.push(`${contact.Firstname} ${contact.Lastname} (${contact.Email})`);
                        } else {
                            values.push(email);
                        }
                    }
                }
                break;
            case NotificationProperty.DATA_EVENTS:
                if (value && Array.isArray(value)) {
                    values = value;
                }
                break;
            case NotificationProperty.DATA_RECIPIENT_AGENTS:
                if (value && Array.isArray(value)) {
                    const users = await KIXObjectService.loadObjects<User>(
                        KIXObjectType.USER, value, null, null, true, true, true
                    ).catch((error) => [] as User[]);
                    const displayTexts = [];
                    if (users && !!users.length) {
                        for (const user of users) {
                            const text = await LabelService.getInstance().getObjectText(user);
                            displayTexts.push(text);
                        }
                    }
                    values = displayTexts.length ? displayTexts : value;
                }
                break;
            case NotificationProperty.DATA_RECIPIENT_ROLES:
                if (value && Array.isArray(value)) {
                    const roles = await KIXObjectService.loadObjects<Role>(
                        KIXObjectType.ROLE, value, null, null, true
                    ).catch((error) => [] as Role[]);
                    const displayTexts = [];
                    if (roles && !!roles.length) {
                        for (const role of roles) {
                            const text = await LabelService.getInstance().getObjectText(role);
                            displayTexts.push(text);
                        }
                    }
                    values = displayTexts.length ? displayTexts : value;
                }
                break;
            default:
        }
        return values;
    }
    public async getObjectTooltip(notification: Notification, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(
                notification.VisibleForAgentTooltip ? notification.VisibleForAgentTooltip : ''
            );
        }
        return notification.VisibleForAgentTooltip ? notification.VisibleForAgentTooltip : '';
    }
}
