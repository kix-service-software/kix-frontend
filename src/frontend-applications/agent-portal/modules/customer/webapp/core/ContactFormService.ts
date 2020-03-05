/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFormService } from "../../../../modules/base-components/webapp/core/KIXObjectFormService";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { FormFieldConfiguration } from "../../../../model/configuration/FormFieldConfiguration";
import { ContactProperty } from "../../model/ContactProperty";
import { FormConfiguration } from "../../../../model/configuration/FormConfiguration";
import { FormGroupConfiguration } from "../../../../model/configuration/FormGroupConfiguration";
import { FormFieldOption } from "../../../../model/configuration/FormFieldOption";
import { CRUD } from "../../../../../../server/model/rest/CRUD";
import { FormFieldOptions } from "../../../../model/configuration/FormFieldOptions";
import { InputFieldTypes } from "../../../base-components/webapp/core/InputFieldTypes";
import { FormService } from "../../../base-components/webapp/core/FormService";
import { UserProperty } from "../../../user/model/UserProperty";
import { IFormInstance } from "../../../base-components/webapp/core/IFormInstance";
import { ObjectReferenceOptions } from "../../../base-components/webapp/core/ObjectReferenceOptions";
import { KIXObjectLoadingOptions } from "../../../../model/KIXObjectLoadingOptions";
import { FilterCriteria } from "../../../../model/FilterCriteria";
import { SearchOperator } from "../../../search/model/SearchOperator";
import { FilterDataType } from "../../../../model/FilterDataType";
import { FilterType } from "../../../../model/FilterType";
import { PersonalSettingsProperty } from "../../../user/model/PersonalSettingsProperty";
import { QueueProperty } from "../../../ticket/model/QueueProperty";
import { NotificationProperty } from "../../../notification/model/NotificationProperty";
import { KIXObjectProperty } from "../../../../model/kix/KIXObjectProperty";
import { OrganisationProperty } from "../../model/OrganisationProperty";
import { FormFieldValue } from "../../../../model/configuration/FormFieldValue";
import { KIXObjectService } from "../../../base-components/webapp/core/KIXObjectService";
import { User } from "../../../user/model/User";
import { ContextService } from "../../../base-components/webapp/core/ContextService";
import { ContextType } from "../../../../model/ContextType";
import { FormContext } from "../../../../model/configuration/FormContext";
import { ServiceRegistry } from "../../../base-components/webapp/core/ServiceRegistry";
import { PersonalSettingsFormService } from "../../../user/webapp/core";
import { ServiceType } from "../../../base-components/webapp/core/ServiceType";
import { Contact } from "../../model/Contact";

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

    public async initValues(form: FormConfiguration): Promise<Map<string, FormFieldValue<any>>> {
        this.editUserId = null;
        this.isAgentDialog = false;
        let contact: Contact;

        const context = ContextService.getInstance().getActiveContext(ContextType.DIALOG);
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

        return await super.initValues(form, contact);
    }

    protected async prePrepareForm(form: FormConfiguration, contact: Contact): Promise<void> {
        this.assignedUserId = contact ? contact.AssignedUserID : this.editUserId ? this.editUserId : null;

        if (form.formContext === FormContext.NEW && this.isAgentDialog) {
            const orgField = this.getFormFieldOfForm(form, ContactProperty.PRIMARY_ORGANISATION_ID);
            if (orgField) {
                orgField.defaultValue = new FormFieldValue(1);
            }
        }

        const accessGroup = await this.getAccessGroup();
        if (accessGroup && form.pages.length) {
            form.pages[0].groups.push(accessGroup);
        }
    }

    private async getAccessGroup(): Promise<FormGroupConfiguration> {
        let accessGroup: FormGroupConfiguration;
        const hasUserCreatePermission = await this.checkPermissions('system/users', [CRUD.CREATE]);
        const hasUserUpdatePermission = await this.checkPermissions('system/users/*', [CRUD.UPDATE]);

        if (hasUserCreatePermission && hasUserUpdatePermission) {
            const accessValue: FormFieldValue = new FormFieldValue([]);
            let accessChildren;
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
            accessChildren = await this.getFormFieldsForAccess(accessValue.value, null);

            const access = new FormFieldConfiguration(
                'contact-form-field-user-access', 'Translatable#Access',
                UserProperty.USER_ACCESS, 'contact-input-access', false,
                'Translatable#Helptext_Users_UserCreateEdit_Access', null,
                accessValue, null, accessChildren
            );
            accessGroup = new FormGroupConfiguration(
                'user-access-group', 'Translatable#Login Information', null, null,
                [access]
            );
        }
        return accessGroup;
    }

    private async loadContact(userId: number): Promise<Contact> {
        let contact: Contact;
        if (userId) {
            const contacts = await KIXObjectService.loadObjects<Contact>(
                KIXObjectType.CONTACT, null,
                new KIXObjectLoadingOptions(
                    [
                        new FilterCriteria(
                            ContactProperty.ASSIGNED_USER_ID, SearchOperator.EQUALS,
                            FilterDataType.NUMERIC, FilterType.AND, userId
                        )
                    ]
                ), null, true
            ).catch(() => [] as Contact[]);
            contact = contacts && contacts.length ? contacts[0] : null;
        }
        return contact;
    }

    private async loadAssignedUser(userId: number): Promise<User> {
        let user: User;
        if (userId) {
            const users = await KIXObjectService.loadObjects<User>(
                KIXObjectType.USER, [userId],
                new KIXObjectLoadingOptions(
                    null, null, null,
                    [UserProperty.PREFERENCES, UserProperty.ROLE_IDS]
                ), null, true
            ).catch((error) => [] as User[]);
            user = users && users.length ? users[0] : null;
        }
        return user;
    }

    public async getFormFieldsForAccess(accesses: string[], formId?: string): Promise<FormFieldConfiguration[]> {
        let fields: FormFieldConfiguration[] = [];
        if (accesses && accesses.length) {
            const formInstance = formId ? await FormService.getInstance().getFormInstance(formId) : null;
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

    private async addLoginField(formInstance?: IFormInstance): Promise<FormFieldConfiguration> {
        let userLoginValue;
        if (formInstance) {
            userLoginValue = await formInstance.getFormFieldValueByProperty(UserProperty.USER_LOGIN);
        }
        if (!userLoginValue && this.assignedUserId) {
            const user = await this.loadAssignedUser(this.assignedUserId);
            if (user) {
                userLoginValue = new FormFieldValue(user.UserLogin);
            }
        }
        return new FormFieldConfiguration(
            'contact-form-field-login',
            'Translatable#Login Name', UserProperty.USER_LOGIN, null, true,
            'Translatable#Helptext_User_UserCreateEdit_Login', null,
            userLoginValue
        );
    }

    private async addPasswordField(formInstance?: IFormInstance): Promise<FormFieldConfiguration> {
        let userPassword;
        if (formInstance) {
            userPassword = await formInstance.getFormFieldValueByProperty(UserProperty.USER_PASSWORD);
        }
        // no else - because user has no password and should not "shown" in edit dialog
        return new FormFieldConfiguration(
            'contact-form-field-password',
            'Translatable#Password', UserProperty.USER_PASSWORD, null, !Boolean(this.assignedUserId),
            'Translatable#Helptext_User_UserCreateEdit_Password',
            [
                new FormFieldOption(FormFieldOptions.INPUT_FIELD_TYPE, InputFieldTypes.PASSWORD)
            ], userPassword, null, null, null, null, null, null, null, null, null, null, null, null,
            this.assignedUserId ? 'Translatable#not modified' : null
        );
    }

    private async addRolesField(
        accesses: string[], formInstance?: IFormInstance
    ): Promise<FormFieldConfiguration> {
        if (accesses && accesses.some((a) => a === UserProperty.IS_AGENT)) {
            let roleIdsValue;
            if (formInstance) {
                roleIdsValue = await formInstance.getFormFieldValueByProperty(UserProperty.ROLE_IDS);
            }
            if (!roleIdsValue && this.assignedUserId) {
                const user = await this.loadAssignedUser(this.assignedUserId);
                if (user && user.RoleIDs) {
                    roleIdsValue = new FormFieldValue(user.RoleIDs);
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
                ], roleIdsValue
            );
            return new FormFieldConfiguration(
                'contact-form-field-roles-container', 'Translatable#Role Assignment', 'ROLES_CONTAINER', null,
                false, null, null, null, null, [roleField], null, null, null, null, null,
                null, null, true, true
            );
        }
    }

    private async addPreferencesFields(
        accesses: string[], formInstance?: IFormInstance
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
        }
        return preferencesField;
    }

    private async getLanguageField(formInstance?: IFormInstance): Promise<FormFieldConfiguration> {
        let languageValue;
        if (formInstance) {
            languageValue = await formInstance.getFormFieldValueByProperty(PersonalSettingsProperty.USER_LANGUAGE);
        }
        if (!languageValue && this.assignedUserId) {
            const user = await this.loadAssignedUser(this.assignedUserId);
            if (user && user.Preferences) {
                const value = user.Preferences.find((p) => p.ID === PersonalSettingsProperty.USER_LANGUAGE);
                if (value && value.Value !== null && typeof value.Value !== 'undefined') {
                    languageValue = new FormFieldValue(value.Value);
                }
            }
        }
        const languageField = new FormFieldConfiguration(
            'contact-form-field-user-language', 'Translatable#Language', PersonalSettingsProperty.USER_LANGUAGE,
            'language-input', true, 'Translatable#Helptext_User_UserCreateEdit_Preferences_UserLanguage', null,
            languageValue
        );
        return languageField;
    }

    private async getQueueField(formInstance?: IFormInstance): Promise<FormFieldConfiguration> {
        let queueFormValue;
        if (formInstance) {
            queueFormValue = await formInstance.getFormFieldValueByProperty(PersonalSettingsProperty.MY_QUEUES);
        }
        if (!queueFormValue && this.assignedUserId) {
            const user = await this.loadAssignedUser(this.assignedUserId);
            if (user && user.Preferences) {
                const value = user.Preferences.find((p) => p.ID === PersonalSettingsProperty.MY_QUEUES);
                if (value && value.Value !== null && typeof value.Value !== 'undefined') {
                    const queueValue = Array.isArray(value.Value) ? value.Value : value.Value.toString().split(',');
                    queueFormValue = new FormFieldValue(queueValue);
                }
            }
        }
        const queueField = new FormFieldConfiguration(
            'contact-form-field-user-queues', 'Translatable#My Queues', PersonalSettingsProperty.MY_QUEUES,
            'object-reference-input', false, 'Translatable#Helptext_User_UserCreateEdit_Preferences_MyQueues',
            [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.QUEUE),
                new FormFieldOption(ObjectReferenceOptions.MULTISELECT, true),
                new FormFieldOption(ObjectReferenceOptions.AS_STRUCTURE, true),
                new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS, new KIXObjectLoadingOptions(
                    [
                        new FilterCriteria(
                            QueueProperty.PARENT_ID, SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, null
                        )
                    ],
                    undefined, undefined, [QueueProperty.SUB_QUEUES], [QueueProperty.SUB_QUEUES])
                ),
                new FormFieldOption(FormFieldOptions.INVALID_CLICKABLE, true)
            ], queueFormValue
        );
        return queueField;
    }

    private async getNotifiactionField(formInstance?: IFormInstance): Promise<FormFieldConfiguration> {
        let notificationValue;
        if (formInstance) {
            notificationValue = await formInstance.getFormFieldValueByProperty(PersonalSettingsProperty.NOTIFICATIONS);
        }
        if (!notificationValue && this.assignedUserId) {
            const value = await this.getNotificationValue(this.assignedUserId);
            notificationValue = new FormFieldValue(value);
        }
        return new FormFieldConfiguration(
            'contact-form-field-user-notifications', 'Translatable#Notifications for Tickets',
            PersonalSettingsProperty.NOTIFICATIONS,
            'object-reference-input', false, 'Translatable#Helptext_User_UserCreateEdit_Preferences_Notifications',
            [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.NOTIFICATION),
                new FormFieldOption(ObjectReferenceOptions.MULTISELECT, true),
                new FormFieldOption(ObjectReferenceOptions.AS_STRUCTURE, false),
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
            ], notificationValue
        );
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

    public async prepareCreateValue(property: string, value: any): Promise<Array<[string, any]>> {
        const parameter: Array<[string, any]> = [];
        if (property === UserProperty.USER_ACCESS) {
            const isAgent = Array.isArray(value) ? Number(value.some((v) => v === UserProperty.IS_AGENT)) : 0;
            parameter.push([UserProperty.IS_AGENT, isAgent]);
            const isCustomer = Array.isArray(value) ? Number(value.some((v) => v === UserProperty.IS_CUSTOMER)) : 0;
            parameter.push([UserProperty.IS_CUSTOMER, isCustomer]);
        } else {
            if (property === ContactProperty.PRIMARY_ORGANISATION_ID) {
                if (typeof value === 'object') {
                    value = value[OrganisationProperty.ID];
                }
                parameter.push([ContactProperty.ORGANISATION_IDS, [value]]);
            }
            parameter.push([property, value]);
        }

        return parameter;
    }

    public async postPrepareValues(parameter: Array<[string, any]>): Promise<Array<[string, any]>> {
        const service = ServiceRegistry.getServiceInstance<PersonalSettingsFormService>(
            KIXObjectType.PERSONAL_SETTINGS, ServiceType.FORM
        );
        if (service) {
            parameter = await service.postPrepareValues(parameter);
        } else {
            parameter = this.prepareParameter(parameter);
        }

        if (this.assignedUserId) {
            parameter.push([ContactProperty.ASSIGNED_USER_ID, this.assignedUserId]);
        }
        return parameter;
    }

    private prepareParameter(parameter: Array<[string, any]>): Array<[string, any]> {
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
}
