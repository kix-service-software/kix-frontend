/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LabelProvider } from '../../../../modules/base-components/webapp/core/LabelProvider';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { Webform } from '../../model/Webform';
import { WebformProperty } from '../../model/WebformProperty';
import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { Queue } from '../../../ticket/model/Queue';
import { TicketState } from '../../../ticket/model/TicketState';
import { TicketPriority } from '../../../ticket/model/TicketPriority';
import { TicketType } from '../../../ticket/model/TicketType';
import { User } from '../../../user/model/User';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../../../model/FilterCriteria';
import { UserProperty } from '../../../user/model/UserProperty';
import { SearchOperator } from '../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../model/FilterDataType';
import { FilterType } from '../../../../model/FilterType';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { KIXObject } from '../../../../model/kix/KIXObject';

export class WebformLabelProvider extends LabelProvider {

    public constructor() {
        super();
        this.kixObjectType = KIXObjectType.WEBFORM;
    }

    public isLabelProviderFor(object: KIXObject): boolean {
        return object instanceof Webform || object?.KIXObjectType === this.kixObjectType;
    }

    public async getPropertyValueDisplayText(
        property: string, value: any, translatable: boolean = true
    ): Promise<string> {
        let displayValue = value;
        switch (property) {
            case WebformProperty.SHOW_TITLE:
            case WebformProperty.MODAL:
            case WebformProperty.USE_KIX_CSS:
            case WebformProperty.ALLOW_ATTACHMENTS:
                const boolValue = Boolean(value);
                displayValue = boolValue ? 'Translatable#Yes' : 'Translatable#No';
                break;
            case WebformProperty.ACCEPTED_DOMAINS:
                translatable = false;
                break;
            case WebformProperty.QUEUE_ID:
                if (value) {
                    const queues = await KIXObjectService.loadObjects<Queue>(
                        KIXObjectType.QUEUE, [value], null, null, true
                    ).catch((error) => [] as Queue[]);
                    const queue = queues.find((q) => q.QueueID.toString() === value.toString());
                    displayValue = queue ? queue.Name : value;
                }
                break;
            case WebformProperty.STATE_ID:
                if (value) {
                    const states = await KIXObjectService.loadObjects<TicketState>(
                        KIXObjectType.TICKET_STATE, [value], null, null, true
                    ).catch((error) => []);
                    displayValue = states && !!states.length ? states[0].Name : value;
                }
                break;
            case WebformProperty.PRIORITY_ID:
                if (value) {
                    const priority = await KIXObjectService.loadObjects<TicketPriority>(
                        KIXObjectType.TICKET_PRIORITY, [value], null, null, true
                    ).catch((error) => []);
                    displayValue = priority && !!priority.length ? priority[0].Name : value;
                }
                break;
            case WebformProperty.TYPE_ID:
                if (value) {
                    const types = await KIXObjectService.loadObjects<TicketType>(
                        KIXObjectType.TICKET_TYPE, [value], null, null, true
                    ).catch((error) => []);
                    displayValue = types && !!types.length ? types[0].Name : value;
                }
                break;
            case WebformProperty.USER_LOGIN:
                if (value) {
                    const users = await KIXObjectService.loadObjects<User>(
                        KIXObjectType.USER, null,
                        new KIXObjectLoadingOptions(
                            [
                                new FilterCriteria(
                                    UserProperty.USER_LOGIN, SearchOperator.EQUALS,
                                    FilterDataType.STRING, FilterType.AND, value
                                )
                            ], null, null, [UserProperty.CONTACT]
                        ),
                        null, true
                    ).catch((error) => [] as User[]);
                    displayValue = users && users.length ?
                        users[0].Contact ? users[0].Contact.Fullname : users[0].UserLogin : value;
                    translatable = false;
                }
                break;
            case WebformProperty.USER_PASSWORD:
                if (value) {
                    displayValue = '*****';
                    translatable = false;
                }
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

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue: string;
        switch (property) {
            case WebformProperty.BUTTON_LABEL:
                displayValue = 'Translatable#Name of activate form button';
                break;
            case WebformProperty.TITLE:
                displayValue = 'Translatable#Form title';
                break;
            case WebformProperty.SHOW_TITLE:
                displayValue = 'Translatable#Show title in form';
                break;
            case WebformProperty.HINT_MESSAGE:
                displayValue = 'Translatable#Information text';
                break;
            case WebformProperty.SAVE_LABEL:
                displayValue = 'Translatable#Name of form submit button';
                break;
            case WebformProperty.SUCCESS_MESSAGE:
                displayValue = 'Translatable#Message after sending form';
                break;
            case WebformProperty.MODAL:
                displayValue = 'Translatable#Start modal dialog for form';
                break;
            case WebformProperty.USE_KIX_CSS:
                displayValue = 'Translatable#Use KIX CSS';
                break;
            case WebformProperty.ALLOW_ATTACHMENTS:
                displayValue = 'Translatable#Enable attachments';
                break;
            case WebformProperty.ACCEPTED_DOMAINS:
                displayValue = 'Translatable#Accepted domains';
                break;
            case WebformProperty.PRIORITY_ID:
                displayValue = short ? 'Translatable#Prio' : 'Translatable#Priority';
                break;
            case WebformProperty.TYPE_ID:
                displayValue = 'Translatable#Type';
                break;
            case WebformProperty.QUEUE_ID:
                displayValue = 'Translatable#Queue';
                break;
            case WebformProperty.STATE_ID:
                displayValue = 'Translatable#State';
                break;
            case WebformProperty.USER_LOGIN:
                displayValue = 'Translatable#Assigned agent';
                break;
            case WebformProperty.USER_PASSWORD:
                displayValue = 'Translatable#Password';
                break;
            default:
                displayValue = await super.getPropertyText(property);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue ? displayValue.toString() : '';
    }

    public async getDisplayText(
        webform: Webform, property: string, defaultValue?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue: string;

        const existingValue = webform.displayValues.find((dv) => dv[0] === property);
        if (existingValue) {
            displayValue = existingValue[1];
        } else {
            displayValue = await this.getPropertyValueDisplayText(property, webform[property], translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue ? displayValue.toString() : '';
    }

    public async getIcons(
        webform: Webform, property: string, value?: string | number
    ): Promise<Array<string | ObjectIcon>> {
        if (webform) {
            value = webform[property];
        }
        const icons = [];

        switch (property) {
            case WebformProperty.PRIORITY_ID:
                icons.push(new ObjectIcon(null, 'Priority', value));
                break;
            case WebformProperty.TYPE_ID:
                icons.push(new ObjectIcon(null, 'TicketType', value));
                break;
            case WebformProperty.QUEUE_ID:
                icons.push(new ObjectIcon(null, 'Queue', value));
                break;
            case WebformProperty.STATE_ID:
                icons.push(new ObjectIcon(null, 'TicketState', value));
                break;
            default:
        }

        return icons;
    }

    public async getObjectText(webform: Webform, id?: boolean, title?: boolean): Promise<string> {
        const webformTitle = await TranslationService.translate('Translatable#Webform');
        const suffix = webform.title ? ` - ${webform.title}` : '';
        return `${webformTitle}${suffix}`;
    }

}
