/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';
import { ContactProperty } from '../../../model/ContactProperty';
import { FormConfiguration } from '../../../../../model/configuration/FormConfiguration';
import { UserProperty } from '../../../../user/model/UserProperty';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { SearchOperator } from '../../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../../model/FilterDataType';
import { FilterType } from '../../../../../model/FilterType';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { User } from '../../../../user/model/User';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { FormContext } from '../../../../../model/configuration/FormContext';
import { ServiceRegistry } from '../../../../base-components/webapp/core/ServiceRegistry';
import { ServiceType } from '../../../../base-components/webapp/core/ServiceType';
import { Contact } from '../../../model/Contact';
import { KIXObjectSpecificCreateOptions } from '../../../../../model/KIXObjectSpecificCreateOptions';
import { RoleProperty } from '../../../../user/model/RoleProperty';
import { Role } from '../../../../user/model/Role';
import { FormInstance } from '../../../../base-components/webapp/core/FormInstance';
import { PersonalSettingsFormService } from '../../../../user/webapp/core/PersonalSettingsFormService';
import { KIXObjectFormService } from '../../../../base-components/webapp/core/KIXObjectFormService';

export class ContactFormService extends KIXObjectFormService {

    private static INSTANCE: ContactFormService;
    private assignedUserId: number;
    private editUserId: number;
    private isAgentDialog: boolean = false;

    public static getInstance(): ContactFormService {
        if (!ContactFormService.INSTANCE) {
            ContactFormService.INSTANCE = new ContactFormService();
        }
        return ContactFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.CONTACT;
    }

    public async hasPermissions(field: FormFieldConfiguration): Promise<boolean> {
        let hasPermissions = true;
        switch (field.property) {
            case ContactProperty.PRIMARY_ORGANISATION_ID:
                hasPermissions = await this.checkPermissions('organisations');
                break;
            default:
        }
        return hasPermissions;
    }

    public async initValues(form: FormConfiguration, formInstance: FormInstance): Promise<void> {
        this.editUserId = null;
        this.isAgentDialog = false;
        let contact: Contact;

        const context = ContextService.getInstance().getActiveContext();
        if (context) {
            this.isAgentDialog = Boolean(context.getAdditionalInformation('IS_AGENT_DIALOG'));
            if (form.formContext === FormContext.EDIT && this.isAgentDialog) {
                const userId = context.getAdditionalInformation('USER_ID');
                if (userId) {
                    contact = await this.loadContact(userId);
                    this.editUserId = userId;
                }
            }
        }

        await super.initValues(form, formInstance, contact);
    }

    protected async prePrepareForm(
        form: FormConfiguration, contact: Contact, formInstance: FormInstance
    ): Promise<void> {
        await super.prePrepareForm(form, contact, formInstance);
        this.assignedUserId = contact ? contact.AssignedUserID : this.editUserId ? this.editUserId : null;
    }


    private async loadContact(userId: number): Promise<Contact> {
        let contact: Contact;
        if (userId) {
            const loadingOptions = new KIXObjectLoadingOptions();
            loadingOptions.includes = [KIXObjectType.CONTACT];

            const user = await KIXObjectService.loadObjects<User>(
                KIXObjectType.USER, [userId], loadingOptions, null, true
            ).catch((): User[] => []);

            contact = user?.length ? user[0].Contact : null;
        }
        return contact;
    }

    public async prepareCreateValue(
        property: string, formField: FormFieldConfiguration, value: any
    ): Promise<Array<[string, any]>> {
        const parameter: Array<[string, any]> = [];
        if (property === UserProperty.USER_ACCESS) {
            let isAgent = 0;
            let isCustomer = 0;
            if (value?.length) {
                isAgent = Array.isArray(value) ? Number(value.some((v) => v === UserProperty.IS_AGENT)) : 0;
                isCustomer = Array.isArray(value) ? Number(value.some((v) => v === UserProperty.IS_CUSTOMER)) : 0;
            }

            parameter.push([UserProperty.IS_AGENT, isAgent]);
            parameter.push([UserProperty.IS_CUSTOMER, isCustomer]);

        } else if (!property.match(/_CONTAINER/)) {
            parameter.push([property, value]);
        }

        return parameter;
    }

    public async postPrepareValues(
        parameter: Array<[string, any]>, createOptions?: KIXObjectSpecificCreateOptions,
        formContext?: FormContext, formInstance?: FormInstance
    ): Promise<Array<[string, any]>> {
        const service = ServiceRegistry.getServiceInstance<PersonalSettingsFormService>(
            KIXObjectType.PERSONAL_SETTINGS, ServiceType.FORM
        );
        if (service) {
            parameter = await service.postPrepareValues(parameter);
        }

        const roleIdsParameter = parameter.find((p) => p[0] === UserProperty.ROLE_IDS);
        if (roleIdsParameter) {
            roleIdsParameter[1] = Array.isArray(roleIdsParameter[1]) ? roleIdsParameter[1] : [roleIdsParameter[1]];

            const isAgent = parameter.find((p) => p[0] === UserProperty.IS_AGENT);
            if (isAgent && isAgent[1]) {
                const role = await this.loadRole('Agent User');
                if (role && !roleIdsParameter[1].some((rid) => rid === role.ID)) {
                    roleIdsParameter[1].push(role.ID);
                }
            }

            const isCustomer = parameter.find((p) => p[0] === UserProperty.IS_CUSTOMER);
            if (isCustomer && isCustomer[1]) {
                const role = await this.loadRole('Customer');
                if (role && !roleIdsParameter[1].some((rid) => rid === role.ID)) {
                    roleIdsParameter[1].push(role.ID);
                }
            }
        }

        if (this.assignedUserId && formContext === FormContext.EDIT) {
            parameter.push([ContactProperty.ASSIGNED_USER_ID, this.assignedUserId]);
        }

        return super.postPrepareValues(parameter, createOptions, formContext, formInstance);
    }

    private async loadRole(name: string): Promise<Role> {
        let role: Role;

        const roles = await KIXObjectService.loadObjects<Role>(
            KIXObjectType.ROLE, null, new KIXObjectLoadingOptions([
                new FilterCriteria(
                    RoleProperty.NAME, SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, name
                )
            ])
        );
        if (roles && roles.length) {
            role = roles[0];
        }

        return role;
    }

    protected async getValue(
        property: string, value: any, contact: Contact,
        formField: FormFieldConfiguration, formContext: FormContext
    ): Promise<any> {
        const user = await this.loadAssignedUser(this.assignedUserId);
        switch (property) {
            case ContactProperty.EMAIL:
            case ContactProperty.EMAIL1:
            case ContactProperty.EMAIL2:
            case ContactProperty.EMAIL3:
            case ContactProperty.EMAIL4:
            case ContactProperty.EMAIL5:
                if (formContext === FormContext.NEW) {
                    value = null;
                }
                break;
            case UserProperty.USER_ACCESS:
                if (user) {
                    value = [];
                    if (user.IsAgent) {
                        value.push(UserProperty.IS_AGENT);
                    }
                    if (user.IsCustomer) {
                        value.push(UserProperty.IS_CUSTOMER);
                    }
                }
                break;
            case UserProperty.USER_LOGIN:
                if (formContext === FormContext.EDIT) {
                    value = user ? user.UserLogin : null;
                }
                break;
            case UserProperty.ROLE_IDS:
                if (formContext === FormContext.EDIT) {
                    value = user && user.RoleIDs ? user.RoleIDs : null;
                }
                break;
            default:
                value = await super.getValue(property, value, contact, formField, formContext);
        }
        return value;
    }

    private async loadAssignedUser(userId: number): Promise<User> {
        let user: User;
        if (userId) {
            const users = await KIXObjectService.loadObjects<User>(
                KIXObjectType.USER, [userId],
                new KIXObjectLoadingOptions(
                    null, null, null,
                    [UserProperty.PREFERENCES, UserProperty.ROLE_IDS]
                ), null, true, true, true
            ).catch((error) => [] as User[]);
            user = users && users.length ? users[0] : null;
        }
        return user;
    }
}
