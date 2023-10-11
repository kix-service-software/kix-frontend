/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFormService } from '../../../../modules/base-components/webapp/core/KIXObjectFormService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { ContactProperty } from '../../model/ContactProperty';
import { FormConfiguration } from '../../../../model/configuration/FormConfiguration';
import { FormGroupConfiguration } from '../../../../model/configuration/FormGroupConfiguration';
import { FormFieldOption } from '../../../../model/configuration/FormFieldOption';
import { CRUD } from '../../../../../../server/model/rest/CRUD';
import { FormFieldOptions } from '../../../../model/configuration/FormFieldOptions';
import { InputFieldTypes } from '../../../base-components/webapp/core/InputFieldTypes';
import { UserProperty } from '../../../user/model/UserProperty';
import { ObjectReferenceOptions } from '../../../base-components/webapp/core/ObjectReferenceOptions';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../../../model/FilterCriteria';
import { SearchOperator } from '../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../model/FilterDataType';
import { FilterType } from '../../../../model/FilterType';
import { PersonalSettingsProperty } from '../../../user/model/PersonalSettingsProperty';
import { NotificationProperty } from '../../../notification/model/NotificationProperty';
import { FormFieldValue } from '../../../../model/configuration/FormFieldValue';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { User } from '../../../user/model/User';
import { ContextService } from '../../../base-components/webapp/core/ContextService';
import { FormContext } from '../../../../model/configuration/FormContext';
import { ServiceRegistry } from '../../../base-components/webapp/core/ServiceRegistry';
import { ServiceType } from '../../../base-components/webapp/core/ServiceType';
import { Contact } from '../../model/Contact';
import { KIXObjectSpecificCreateOptions } from '../../../../model/KIXObjectSpecificCreateOptions';
import { RoleProperty } from '../../../user/model/RoleProperty';
import { Role } from '../../../user/model/Role';
import { FormInstance } from '../../../base-components/webapp/core/FormInstance';
import { PersonalSettingsFormService } from '../../../user/webapp/core/PersonalSettingsFormService';
import { IdService } from '../../../../model/IdService';

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

        if (form.formContext === FormContext.NEW && this.isAgentDialog) {
            const orgField = this.getFormFieldOfForm(form, ContactProperty.PRIMARY_ORGANISATION_ID);
            if (orgField) {
                orgField.defaultValue = new FormFieldValue(1);
            }
        }

        const accessGroup = await this.getAccessGroup(formInstance);
        if (accessGroup && form.pages.length) {
            form.pages[0].groups.push(accessGroup);
        }
    }

    private async getAccessGroup(formInstance: FormInstance): Promise<FormGroupConfiguration> {
        let accessGroup: FormGroupConfiguration;
        const hasUserCreatePermission = await this.checkPermissions('system/users', [CRUD.CREATE]);
        const hasUserUpdatePermission = await this.checkPermissions('system/users', [CRUD.CREATE]);

        if (hasUserCreatePermission && hasUserUpdatePermission) {
            const accessValue: FormFieldValue = new FormFieldValue([]);
            if (this.assignedUserId) {
                const user = await this.loadAssignedUser(this.assignedUserId);
                if (user) {
                    if (user.IsAgent) {
                        accessValue.value.push(UserProperty.IS_AGENT);
                    }
                    if (user.IsCustomer) {
                        accessValue.value.push(UserProperty.IS_CUSTOMER);
                    }
                }
            } else if (this.isAgentDialog) {
                accessValue.value.push(UserProperty.IS_AGENT);
            }
            const accessChildren = await this.getFormFieldsForAccess(accessValue.value, formInstance);

            const access = new FormFieldConfiguration(
                'contact-form-field-user-access', 'Translatable#Access',
                UserProperty.USER_ACCESS, 'contact-input-access', false,
                'Translatable#Helptext_Users_UserCreateEdit_Access', null,
                accessValue, null, accessChildren
            );
            access.instanceId = IdService.generateDateBasedId();
            accessGroup = new FormGroupConfiguration(
                'user-information-group', 'Translatable#User Information', null, null,
                [access]
            );
        }
        return accessGroup;
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

    public async getFormFieldsForAccess(
        accesses: string[], formInstance: FormInstance
    ): Promise<FormFieldConfiguration[]> {
        let fields: FormFieldConfiguration[] = [];
        if (accesses && accesses.length) {
            const fieldPromises = [
                this.addLoginField(formInstance),
                this.addPasswordField(formInstance),
                this.addRolesField(accesses, formInstance),
                this.addPreferencesFields(accesses, formInstance),
            ];
            await Promise.all(fieldPromises).then((newFields: FormFieldConfiguration[]) => {
                fields = newFields.filter((nf) => typeof nf !== 'undefined' && nf !== null);
            });
        }
        return fields;
    }

    private async addLoginField(formInstance?: FormInstance): Promise<FormFieldConfiguration> {
        const value = formInstance
            ? await formInstance.getFormFieldValueByProperty(UserProperty.USER_LOGIN)
            : null;
        const loginField = new FormFieldConfiguration(
            'contact-form-field-login',
            'Translatable#Login Name', UserProperty.USER_LOGIN, null, true,
            'Translatable#Helptext_User_UserCreateEdit_Login', null, value
        );
        loginField.instanceId = IdService.generateDateBasedId();
        return loginField;
    }

    private async addPasswordField(formInstance?: FormInstance): Promise<FormFieldConfiguration> {
        const passwordField = new FormFieldConfiguration(
            'contact-form-field-password',
            'Translatable#Password', UserProperty.USER_PASSWORD, null, !this.assignedUserId,
            'Translatable#Helptext_User_UserCreateEdit_Password',
            [
                new FormFieldOption(FormFieldOptions.INPUT_FIELD_TYPE, InputFieldTypes.PASSWORD)
            ], null, null, null, null, null, null, null, null, null, null, null, null, null,
            this.assignedUserId ? 'Translatable#not modified' : null
        );

        passwordField.instanceId = IdService.generateDateBasedId();
        return passwordField;
    }

    private async addRolesField(
        accesses: string[], formInstance?: FormInstance
    ): Promise<FormFieldConfiguration> {
        const value = formInstance ? await formInstance.getFormFieldValueByProperty(UserProperty.ROLE_IDS) : null;
        const roleIds = value && Array.isArray(value.value) ? value.value : [];

        if (accesses && accesses.some((a) => a === UserProperty.IS_AGENT)) {
            const role = await this.loadRole('Agent User');
            if (role && !roleIds.some((rid) => rid === role.ID)) {
                roleIds.push(role.ID);
            }
        }

        if (accesses && accesses.some((a) => a === UserProperty.IS_CUSTOMER)) {
            const role = await this.loadRole('Customer');
            if (role && !roleIds.some((rid) => rid === role.ID)) {
                roleIds.push(role.ID);
            }
        }

        const roleField = new FormFieldConfiguration(
            'contact-form-field-user-roles',
            'Translatable#Roles', UserProperty.ROLE_IDS, 'object-reference-input', false,
            'Translatable#Helptext_Users_UserCreateEdit_Roles',
            [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.ROLE),
                new FormFieldOption(ObjectReferenceOptions.MULTISELECT, true),
                new FormFieldOption(FormFieldOptions.INVALID_CLICKABLE, true)
            ], new FormFieldValue(roleIds)
        );
        roleField.instanceId = IdService.generateDateBasedId();

        return new FormFieldConfiguration(
            'contact-form-field-roles-container', 'Translatable#Role Assignment', 'ROLES_CONTAINER', null,
            false, null, null, null, null, [roleField], null, null, null, null, null,
            null, null, true, true
        );
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

    private async addPreferencesFields(
        accesses: string[], formInstance?: FormInstance
    ): Promise<FormFieldConfiguration> {
        const languageField = await this.getLanguageField(formInstance);

        const preferencesField = new FormFieldConfiguration(
            'contact-form-field-preferences-container', 'Translatable#Preferences', 'PREFERENCES_CONTAINER', null,
            false, null, null, null, null, [languageField], null, null, null, null, null,
            null, null, true, true
        );

        if (accesses && accesses.some((a) => a === UserProperty.IS_AGENT)) {
            const queueField = await this.getQueueField(formInstance);
            preferencesField.children.push(queueField);

            const notificationField = await this.getNotifiactionField(formInstance);
            preferencesField.children.push(notificationField);

            if (formInstance?.getFormContext() === FormContext.EDIT) {
                const userTokenField = await this.createUserTokenField(formInstance);
                preferencesField.children.push(userTokenField);
            }
        }
        preferencesField.instanceId = IdService.generateDateBasedId();
        return preferencesField;
    }

    private async createUserTokenField(formInstance: FormInstance): Promise<FormFieldConfiguration> {
        const value = formInstance
            ? await formInstance.getFormFieldValueByProperty(PersonalSettingsProperty.USER_TOKEN)
            : null;

        const tokenField = new FormFieldConfiguration(
            'contact-form-field-user-token', 'Translatable#User Token', PersonalSettingsProperty.USER_TOKEN,
            'user-token-input', false, 'Translatable#Helptext_User_UserCreateEdit_Preferences_UserToken',
            [new FormFieldOption(UserProperty.USER_ID, this.assignedUserId),], value
        );
        tokenField.instanceId = IdService.generateDateBasedId();
        return tokenField;
    }

    private async getLanguageField(formInstance?: FormInstance): Promise<FormFieldConfiguration> {
        const value = formInstance
            ? await formInstance.getFormFieldValueByProperty(UserProperty.USER_LANGUAGE)
            : null;
        const languageField = new FormFieldConfiguration(
            'contact-form-field-user-language', 'Translatable#Language', PersonalSettingsProperty.USER_LANGUAGE,
            'language-input', true, 'Translatable#Helptext_User_UserCreateEdit_Preferences_UserLanguage', null, value
        );
        languageField.instanceId = IdService.generateDateBasedId();
        return languageField;
    }

    private async getQueueField(formInstance?: FormInstance): Promise<FormFieldConfiguration> {
        const value = formInstance
            ? await formInstance.getFormFieldValueByProperty(UserProperty.MY_QUEUES)
            : null;
        const queueField = new FormFieldConfiguration(
            'contact-form-field-user-queues', 'Translatable#My Queues', PersonalSettingsProperty.MY_QUEUES,
            'object-reference-input', false, 'Translatable#Helptext_User_UserCreateEdit_Preferences_MyQueues',
            [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.QUEUE),
                new FormFieldOption(ObjectReferenceOptions.MULTISELECT, true),
                new FormFieldOption(ObjectReferenceOptions.USE_OBJECT_SERVICE, true),
                new FormFieldOption(FormFieldOptions.INVALID_CLICKABLE, true)
            ], value
        );
        queueField.instanceId = IdService.generateDateBasedId();
        return queueField;
    }

    private async getNotifiactionField(formInstance?: FormInstance): Promise<FormFieldConfiguration> {
        const value = formInstance
            ? await formInstance.getFormFieldValueByProperty(UserProperty.NOTIFICATIONS)
            : null;
        const notificationField = new FormFieldConfiguration(
            'contact-form-field-user-notifications', 'Translatable#Notifications for Tickets',
            PersonalSettingsProperty.NOTIFICATIONS,
            'object-reference-input', false, 'Translatable#Helptext_User_UserCreateEdit_Preferences_Notifications',
            [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.NOTIFICATION),
                new FormFieldOption(ObjectReferenceOptions.MULTISELECT, true),
                new FormFieldOption(ObjectReferenceOptions.USE_OBJECT_SERVICE, false),
                new FormFieldOption(
                    ObjectReferenceOptions.LOADINGOPTIONS,
                    new KIXObjectLoadingOptions([
                        new FilterCriteria(
                            'Data.' + NotificationProperty.DATA_VISIBLE_FOR_AGENT,
                            SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, 1
                        )
                    ])
                ),
                new FormFieldOption(FormFieldOptions.INVALID_CLICKABLE, true)
            ], value
        );

        notificationField.instanceId = IdService.generateDateBasedId();
        return notificationField;
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
        } else {
            parameter = await this.prepareParameter(parameter);
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

    private async prepareParameter(parameter: Array<[string, any]>): Promise<Array<[string, any]>> {
        const queuesParameter = parameter.find((p) => p[0] === PersonalSettingsProperty.MY_QUEUES);
        if (queuesParameter) {
            queuesParameter[1] = Array.isArray(queuesParameter[1]) ? queuesParameter[1].join(',') : '';
        }

        const notificationParameter = parameter.find((p) => p[0] === PersonalSettingsProperty.NOTIFICATIONS);
        if (notificationParameter) {
            const transport = 'Email';
            const notificationPreference = {};
            if (Array.isArray(notificationParameter[1])) {
                notificationParameter[1].forEach((e) => {
                    const eventKey = `Notification-${e}-${transport}`;
                    notificationPreference[eventKey] = 1;
                });

            }

            notificationParameter[1] = JSON.stringify(notificationPreference);
        }

        return parameter;
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
            case UserProperty.USER_LANGUAGE:
                if (formContext === FormContext.EDIT) {
                    if (user && user.Preferences) {
                        const pref = user.Preferences.find((p) => p.ID === PersonalSettingsProperty.USER_LANGUAGE);
                        if (pref && pref.Value !== null && typeof pref.Value !== 'undefined') {
                            value = pref.Value;
                        }
                    }
                }
                break;
            case PersonalSettingsProperty.MY_QUEUES:
                if (formContext === FormContext.EDIT) {
                    if (user && user.Preferences) {
                        const pref = user.Preferences.find((p) => p.ID === PersonalSettingsProperty.MY_QUEUES);
                        if (pref && pref.Value !== null && typeof pref.Value !== 'undefined') {
                            const queueValue = Array.isArray(pref.Value)
                                ? pref.Value
                                : pref.Value.toString().split(',');
                            value = queueValue;
                        }
                    }
                }
                break;
            case PersonalSettingsProperty.NOTIFICATIONS:
                if (formContext === FormContext.EDIT) {
                    const notificationValue = await this.getNotificationValue(this.assignedUserId);
                    value = notificationValue;
                }
                break;
            case PersonalSettingsProperty.USER_TOKEN:
                if (formContext === FormContext.EDIT) {
                    const tokenValue = user.Preferences.find(
                        (p) => p.ID === PersonalSettingsProperty.USER_TOKEN
                    );
                    value = tokenValue?.Value;
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

    private async getNotificationValue(userId: number): Promise<number[]> {
        const user = await this.loadAssignedUser(userId);
        let value = [];

        let preferenceValue;
        if (user && user.Preferences) {
            preferenceValue = user.Preferences.find((p) => p.ID === PersonalSettingsProperty.NOTIFICATIONS);
        }

        const service = ServiceRegistry.getServiceInstance<PersonalSettingsFormService>(
            KIXObjectType.PERSONAL_SETTINGS, ServiceType.FORM
        );
        if (service) {
            value = await service.handleNotifications(preferenceValue ? preferenceValue.Value : null);
        } else if (preferenceValue && preferenceValue.Value) {
            try {
                const notifications = JSON.parse(preferenceValue.Value);
                for (const key in notifications) {
                    if (notifications[key]) {
                        value.push(Number(key.split('-')[1]));
                    }
                }
            } catch (e) {
                console.warn('Could not load/parse notification preference.');
            }
        }
        return value;
    }
}
