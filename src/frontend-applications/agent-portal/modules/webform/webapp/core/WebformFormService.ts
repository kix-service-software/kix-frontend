/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { FormInstance } from '../../../base-components/webapp/core/FormInstance';
import { KIXObjectSpecificCreateOptions } from '../../../../model/KIXObjectSpecificCreateOptions';
import { TicketService } from '../../../ticket/webapp/core';

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

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
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
                                    value = await TicketService.getDefaultQueueID();
                                    break;
                                case WebformProperty.PRIORITY_ID:
                                    value = await TicketService.getDefaultPriorityID();
                                    break;
                                case WebformProperty.TYPE_ID:
                                    value = await TicketService.getDefaultTypeID();
                                    break;
                                case WebformProperty.STATE_ID:
                                    value = await TicketService.getDefaultStateID();
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
            default:
        }
        return value;
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
        if (
            acceptedDomainsParameter
            && acceptedDomainsParameter[1]
            && acceptedDomainsParameter[1].match(/^\*$/)
        ) {
            acceptedDomainsParameter[1] = '.*';
        }
        return super.postPrepareValues(parameter, createOptions, formContext, formInstance);
    }

}
