/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldConfiguration } from '../../../../../../model/configuration/FormFieldConfiguration';
import { FormFieldOption } from '../../../../../../model/configuration/FormFieldOption';
import { KIXObject } from '../../../../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { KIXObjectService } from '../../../../../base-components/webapp/core/KIXObjectService';
import { ObjectReferenceOptions } from '../../../../../base-components/webapp/core/ObjectReferenceOptions';
import { JobTypes } from '../../../../../job/model/JobTypes';
import { MacroAction } from '../../../../../job/model/MacroAction';
import { MacroActionTypeOption } from '../../../../../job/model/MacroActionTypeOption';
import { ExtendedJobFormManager } from '../../../../../job/webapp/core/ExtendedJobFormManager';
import { Channel } from '../../../../model/Channel';
import { Queue } from '../../../../model/Queue';
import { TicketPriority } from '../../../../model/TicketPriority';
import { TicketState } from '../../../../model/TicketState';
import { TicketType } from '../../../../model/TicketType';

export class TicketArticleCreate extends ExtendedJobFormManager {

    public async createOptionField(
        action: MacroAction, option: MacroActionTypeOption, actionType: string, actionFieldInstanceId: string,
        jobType: string
    ): Promise<FormFieldConfiguration> {
        if (
            jobType === JobTypes.TICKET
            && (actionType === 'ArticleCreate' || actionType === 'TicketCreate')
        ) {
            let defaultValue;
            if (action && action.Parameters) {
                defaultValue = action.Parameters[option.Name];
            }
            if (option.Name === 'Body') {
                return this.getOptionField(
                    option, actionType, actionFieldInstanceId, 'rich-text-input',
                    defaultValue
                );
            } else if (option.Name === 'CustomerVisible') {
                if (action && action.Parameters) {
                    defaultValue = Boolean(action.Parameters[option.Name]);
                }
                return this.getOptionField(
                    option, actionType, actionFieldInstanceId, 'checkbox-input',
                    defaultValue
                );
            } else if (option.Name === 'OrganisationNumberOrID') {
                const field = this.getOptionField(
                    option, actionType, actionFieldInstanceId, 'object-reference-input',
                    defaultValue
                );
                this.setReferencedObjectOptions(field, KIXObjectType.ORGANISATION, false, true, true);
                return field;
            } else if (option.Name === 'ContactEmailOrID') {
                const field = this.getOptionField(
                    option, actionType, actionFieldInstanceId, 'object-reference-input',
                    defaultValue
                );
                this.setReferencedObjectOptions(field, KIXObjectType.CONTACT, false, true, true);
                return field;
            } else if (option.Name === 'OwnerLoginOrID' || option.Name === 'ResponsibleLoginOrID') {
                const field = this.getOptionField(
                    option, actionType, actionFieldInstanceId, 'object-reference-input',
                    defaultValue
                );
                this.setReferencedObjectOptions(field, KIXObjectType.USER, false, true, true);
                return field;
            } else if (option.Name === 'Channel') {
                const field = this.getOptionField(
                    option, actionType, actionFieldInstanceId, 'object-reference-input',
                    defaultValue
                );
                this.setReferencedObjectOptions(field, KIXObjectType.CHANNEL, false, true, false);
                return field;
            } else if (option.Name === 'Priority') {
                const field = this.getOptionField(
                    option, actionType, actionFieldInstanceId, 'object-reference-input',
                    defaultValue
                );
                this.setReferencedObjectOptions(field, KIXObjectType.TICKET_PRIORITY, false, true, false);
                return field;
            } else if (option.Name === 'State') {
                const field = this.getOptionField(
                    option, actionType, actionFieldInstanceId, 'object-reference-input',
                    defaultValue
                );
                this.setReferencedObjectOptions(field, KIXObjectType.TICKET_STATE, false, true, false);
                return field;
            } else if (option.Name === 'Team') {
                const field = this.getOptionField(
                    option, actionType, actionFieldInstanceId, 'object-reference-input',
                    defaultValue
                );
                this.setReferencedObjectOptions(field, KIXObjectType.QUEUE, false, true, false);
                return field;
            } else if (option.Name === 'Type') {
                const field = this.getOptionField(
                    option, actionType, actionFieldInstanceId, 'object-reference-input',
                    defaultValue
                );
                this.setReferencedObjectOptions(field, KIXObjectType.TICKET_TYPE, false, true, false);
                return field;
            }
        }
        return;
    }

    private setReferencedObjectOptions(
        field: FormFieldConfiguration, objectType: KIXObjectType, multiselect: boolean, freeText: boolean,
        autocomplete: boolean
    ): void {
        field.options.push(new FormFieldOption(ObjectReferenceOptions.OBJECT, objectType));
        field.options.push(new FormFieldOption(ObjectReferenceOptions.MULTISELECT, multiselect));
        field.options.push(new FormFieldOption(ObjectReferenceOptions.AUTOCOMPLETE, autocomplete));
        field.options.push(new FormFieldOption(ObjectReferenceOptions.FREETEXT, freeText));
    }

    public async postPrepareOptionValue(
        actionType: string, optionName: string, value: any, parameter: {}
    ): Promise<any> {
        if ((actionType === 'ArticleCreate' || actionType === 'TicketCreate')) {
            if (optionName === 'CustomerVisible') {
                return Number(value);
            }
            // This option of the actions do not support id. The name of the object is required
            else if (optionName === 'Channel' && !isNaN(value)) {
                const object = await this.loadObject<Channel>(KIXObjectType.CHANNEL, value);
                if (object) {
                    return object.Name;
                }
            } else if (optionName === 'Priority' && !isNaN(value)) {
                const object = await this.loadObject<TicketPriority>(KIXObjectType.TICKET_PRIORITY, value);
                if (object) {
                    return object.Name;
                }
            } else if (optionName === 'State' && !isNaN(value)) {
                const object = await this.loadObject<TicketState>(KIXObjectType.TICKET_STATE, value);
                if (object) {
                    return object.Name;
                }
            } else if (optionName === 'Team' && !isNaN(value)) {
                const object = await this.loadObject<Queue>(KIXObjectType.QUEUE, value);
                if (object) {
                    const queueName = await this.getQueueName(object);
                    return queueName;
                }
            } else if (optionName === 'Type' && !isNaN(value)) {
                const object = await this.loadObject<TicketType>(KIXObjectType.TICKET_TYPE, value);
                if (object) {
                    return object.Name;
                }
            }
        }
    }

    private async loadObject<T extends KIXObject>(objectType: KIXObjectType, id: number): Promise<T> {
        let object: T;
        const channels = await KIXObjectService.loadObjects<T>(objectType, [id]);
        if (Array.isArray(channels) && channels.length) {
            object = channels[0];
        }

        return object;
    }

    private async getQueueName(queue: Queue): Promise<string> {
        let queueName = queue.Name;
        if (queue.ParentID) {
            const parentQeue = await this.loadObject<Queue>(KIXObjectType.QUEUE, queue.ParentID);
            if (parentQeue) {
                queueName = `${parentQeue.Name}::${queueName}`;
            }
        }

        return queueName;
    }
}