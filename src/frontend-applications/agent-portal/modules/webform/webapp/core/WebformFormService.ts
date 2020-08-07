/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFormService } from '../../../../modules/base-components/webapp/core/KIXObjectFormService';
import { Webform } from '../../model/Webform';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { FormConfiguration } from '../../../../model/configuration/FormConfiguration';
import { FormFieldValue } from '../../../../model/configuration/FormFieldValue';
import { FormContext } from '../../../../model/configuration/FormContext';
import { WebformProperty } from '../../model/WebformProperty';
import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { User } from '../../../user/model/User';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../../../model/FilterCriteria';
import { UserProperty } from '../../../user/model/UserProperty';
import { SearchOperator } from '../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../model/FilterDataType';
import { FilterType } from '../../../../model/FilterType';
import { SysConfigOption } from '../../../sysconfig/model/SysConfigOption';
import { SysConfigKey } from '../../../sysconfig/model/SysConfigKey';
import { Queue } from '../../../ticket/model/Queue';
import { QueueProperty } from '../../../ticket/model/QueueProperty';
import { TicketPriority } from '../../../ticket/model/TicketPriority';
import { TicketPriorityProperty } from '../../../ticket/model/TicketPriorityProperty';
import { TicketType } from '../../../ticket/model/TicketType';
import { TicketTypeProperty } from '../../../ticket/model/TicketTypeProperty';
import { TicketState } from '../../../ticket/model/TicketState';
import { TicketStateProperty } from '../../../ticket/model/TicketStateProperty';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { FormInstance } from '../../../base-components/webapp/core/FormInstance';
import { KIXObjectSpecificCreateOptions } from '../../../../model/KIXObjectSpecificCreateOptions';

export class WebformFormService extends KIXObjectFormService {

    private static INSTANCE: WebformFormService = null;

    public static getInstance(): WebformFormService {
        if (!WebformFormService.INSTANCE) {
            WebformFormService.INSTANCE = new WebformFormService();
        }

        return WebformFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.WEBFORM;
    }

    protected async postPrepareForm(
        form: FormConfiguration, formInstance: FormInstance,
        formFieldValues: Map<string, FormFieldValue<any>>, webform: Webform
    ): Promise<void> {
        const hasConfigPermissions = await this.checkPermissions('system/config');
        if (form) {
            for (const p of form.pages) {
                for (const g of p.groups) {
                    for (const f of g.formFields) {
                        if (hasConfigPermissions && form.formContext === FormContext.NEW) {
                            let value;
                            switch (f.property) {
                                case WebformProperty.QUEUE_ID:
                                    value = await this.getDefaultQueueID();
                                    break;
                                case WebformProperty.PRIORITY_ID:
                                    value = await this.getDefaultPriorityID();
                                    break;
                                case WebformProperty.TYPE_ID:
                                    value = await this.getDefaultTypeID();
                                    break;
                                case WebformProperty.STATE_ID:
                                    value = await this.getDefaultStateID();
                                    break;
                                default:
                            }
                            if (value) {
                                formFieldValues.set(f.instanceId, new FormFieldValue(value));
                            }
                        }
                        if (form.formContext === FormContext.EDIT && f.property === WebformProperty.USER_PASSWORD) {
                            formFieldValues.set(f.instanceId, new FormFieldValue('--NOT_CHANGED--'));
                        }
                    }
                }
            }
        }
    }

    protected async getValue(property: string, value: any, webform: Webform): Promise<any> {
        switch (property) {
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
                            ]
                        ),
                        null, true
                    ).catch((error) => [] as User[]);
                    value = users && !!users.length ? users[0].ObjectId : value;
                }
                break;
            case WebformProperty.ACCEPTED_DOMAINS:
                if (Array.isArray(value)) {
                    value = value.join(',');
                }
                break;
            default:
        }
        return value;
    }

    private async getDefaultConfigValue(configId: string): Promise<string> {
        let name;
        if (configId) {
            const defaultOptions = await KIXObjectService.loadObjects<SysConfigOption>(
                KIXObjectType.SYS_CONFIG_OPTION, [configId], null, null, true
            );
            if (defaultOptions && !!defaultOptions.length) {
                name = defaultOptions[0].Value;
            }
        }
        return name;
    }

    private async getDefaultQueueID(): Promise<number> {
        let queueId: number;
        const name = await this.getDefaultConfigValue(SysConfigKey.POSTMASTER_DEFAULT_QUEUE);
        if (name) {
            const queues = await KIXObjectService.loadObjects<Queue>(
                KIXObjectType.QUEUE, null, new KIXObjectLoadingOptions(
                    [
                        new FilterCriteria(
                            QueueProperty.NAME, SearchOperator.EQUALS, FilterDataType.STRING,
                            FilterType.AND, name
                        )
                    ]
                ), null, true
            );
            queueId = queues && !!queues.length ? queues[0].QueueID : null;
        }
        return queueId;
    }

    private async getDefaultPriorityID(): Promise<number> {
        let priorityId: number;
        const name = await this.getDefaultConfigValue(SysConfigKey.POSTMASTER_DEFAULT_PRIORITY);
        if (name) {
            const objects = await KIXObjectService.loadObjects<TicketPriority>(
                KIXObjectType.TICKET_PRIORITY, null, new KIXObjectLoadingOptions(
                    [
                        new FilterCriteria(
                            TicketPriorityProperty.NAME, SearchOperator.EQUALS, FilterDataType.STRING,
                            FilterType.AND, name
                        )
                    ]
                ), null, true
            );
            priorityId = objects && !!objects.length ? objects[0].ID : null;
        }
        return priorityId;
    }

    private async getDefaultTypeID(): Promise<number> {
        let typeId: number;
        const name = await this.getDefaultConfigValue(SysConfigKey.TICKET_TYPE_DEFAULT);
        if (name) {
            const objects = await KIXObjectService.loadObjects<TicketType>(
                KIXObjectType.TICKET_TYPE, null, new KIXObjectLoadingOptions(
                    [
                        new FilterCriteria(
                            TicketTypeProperty.NAME, SearchOperator.EQUALS, FilterDataType.STRING,
                            FilterType.AND, name
                        )
                    ]
                ), null, true
            );
            typeId = objects && !!objects.length ? objects[0].ID : null;
        }
        return typeId;
    }

    private async getDefaultStateID(): Promise<number> {
        let stateId: number;
        const name = await this.getDefaultConfigValue(SysConfigKey.POSTMASTER_DEFAULT_STATE);
        if (name) {
            const objects = await KIXObjectService.loadObjects<TicketState>(
                KIXObjectType.TICKET_STATE, null, new KIXObjectLoadingOptions(
                    [
                        new FilterCriteria(
                            TicketStateProperty.NAME, SearchOperator.EQUALS, FilterDataType.STRING,
                            FilterType.AND, name
                        )
                    ]
                ), null, true
            );
            stateId = objects && !!objects.length ? objects[0].ID : null;
        }
        return stateId;
    }

    public async prepareCreateValue(
        property: string, formField: FormFieldConfiguration, value: any
    ): Promise<Array<[string, any]>> {
        const parameter: Array<[string, any]> = [];
        if (value) {
            if (property === WebformProperty.USER_LOGIN) {
                const users = await KIXObjectService.loadObjects<User>(
                    KIXObjectType.USER, [value], null, null, true, true, true
                ).catch((error) => [] as User[]);
                value = users && !!users.length ? users[0].UserLogin : value;
            }
            parameter.push([property, value]);
        }

        return parameter;
    }

    public async postPrepareValues(
        parameter: Array<[string, any]>, createOptions?: KIXObjectSpecificCreateOptions,
        formContext?: FormContext, formInstance?: FormInstance
    ): Promise<Array<[string, any]>> {
        const acceptedDomainsParameter = parameter.find((p) => p[0] === WebformProperty.ACCEPTED_DOMAINS);
        if (acceptedDomainsParameter && acceptedDomainsParameter[1] !== null) {
            let preparedValue: string;
            if (acceptedDomainsParameter[1].match(/^(\*|\.(\*|\+))$/)) {
                preparedValue = '/.*/';
            } else {
                const domains = Webform.getDomains(acceptedDomainsParameter[1]);
                preparedValue = domains.join(',');
            }
            acceptedDomainsParameter[1] = preparedValue;
        }
        return super.postPrepareValues(parameter, createOptions, formContext, formInstance);
    }

}
