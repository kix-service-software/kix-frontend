/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { SysConfigOption } from '../../../../sysconfig/model/SysConfigOption';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { FormConfiguration } from '../../../../../model/configuration/FormConfiguration';
import { FormContext } from '../../../../../model/configuration/FormContext';
import { FormPageConfiguration } from '../../../../../model/configuration/FormPageConfiguration';
import { FormGroupConfiguration } from '../../../../../model/configuration/FormGroupConfiguration';
import { FormService } from '../../../../base-components/webapp/core/FormService';
import { FormFieldOption } from '../../../../../model/configuration/FormFieldOption';
import { DefaultSelectInputFormOption } from '../../../../../model/configuration/DefaultSelectInputFormOption';
import { TreeNode } from '../../../../base-components/webapp/core/tree';
import { SysConfigOptionDefinition } from '../../../../sysconfig/model/SysConfigOptionDefinition';
import { ValidationSeverity } from '../../../../base-components/webapp/core/ValidationSeverity';
import { BrowserUtil } from '../../../../base-components/webapp/core/BrowserUtil';
import { FormInstance } from '../../../../base-components/webapp/core/FormInstance';
import { SysConfigOptionProperty } from '../../../../sysconfig/model/SysConfigOptionProperty';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { FormEvent } from '../../../../base-components/webapp/core/FormEvent';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
import { FormValuesChangedEventData } from '../../../../base-components/webapp/core/FormValuesChangedEventData';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';
import { FormFieldValue } from '../../../../../model/configuration/FormFieldValue';
import { SetupStep } from '../../../../setup-assistant/webapp/core/SetupStep';
import { SetupService } from '../../../../setup-assistant/webapp/core/SetupService';
import { FormFieldOptions } from '../../../../../model/configuration/FormFieldOptions';
import { InputFieldTypes } from '../../../../base-components/webapp/core/InputFieldTypes';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { SystemAddress } from '../../../../system-address/model/SystemAddress';
import { AuthenticationSocketClient } from '../../../../base-components/webapp/core/AuthenticationSocketClient';
import { CRUD } from '../../../../../../../server/model/rest/CRUD';
import { UIComponentPermission } from '../../../../../model/UIComponentPermission';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { SystemAddressProperty } from '../../../../system-address/model/SystemAddressProperty';
import { SearchOperator } from '../../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../../model/FilterDataType';
import { FilterType } from '../../../../../model/FilterType';
import { FormValidationService } from '../../../../base-components/webapp/core/FormValidationService';
import { ObjectReferenceOptions } from '../../../../base-components/webapp/core/ObjectReferenceOptions';

class Component extends AbstractMarkoComponent<ComponentState> {

    private configKeys: string[] = [];
    private subscriber: IEventSubscriber;
    private step: SetupStep;
    private systemAddress: SystemAddress;
    private canUpdateSystemAddress: boolean;

    public onCreate(input: any): void {
        this.state = new ComponentState();
        this.state.isSetup = typeof input.setup === 'undefined' ? false : input.setup;
    }

    public onInput(input: any): void {
        this.step = input.step;
        this.state.completed = this.step ? this.step.completed : false;
    }

    public async onMount(): Promise<void> {
        this.configKeys = [
            'SendmailModule',
            'SendmailEnvelopeFrom', 'SendmailNotificationEnvelopeFrom', 'SendmailNotificationEnvelopeFrom::FallbackToEmailFrom'
        ];

        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Save & Continue', 'Translatable#Skip & Continue', 'Translatable#Save'
        ]);

        await this.initSystemAddress();

        await this.prepareForm();
        this.state.prepared = true;
    }

    private async prepareForm(): Promise<void> {
        const sysconfigDefinitions = await KIXObjectService.loadObjects<SysConfigOptionDefinition>(
            KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, this.configKeys
        );

        const sysconfigOptions = await KIXObjectService.loadObjects<SysConfigOption>(
            KIXObjectType.SYS_CONFIG_OPTION, this.configKeys
        );

        const typeHint = sysconfigDefinitions.find((o) => o.Name === 'SendmailModule').Description || '';
        const typeReadonly = sysconfigOptions.find((o) => o.Name === 'SendmailModule').ReadOnly;

        const sendMailModuleField = new FormFieldConfiguration(
            'SendmailModule', 'Translatable#Type', 'SendmailModule', 'default-select-input', true, typeHint,
            [
                new FormFieldOption(DefaultSelectInputFormOption.NODES,
                    [
                        new TreeNode('Kernel::System::Email::DoNotSendEmail', 'DoNotSendEmail'),
                        new TreeNode('Kernel::System::Email::SMTP', 'SMTP'),
                        new TreeNode('Kernel::System::Email::SMTP_OAuth2', 'SMTP OAuth2'),
                        new TreeNode('Kernel::System::Email::SMTPS', 'SMTPS'),
                        new TreeNode('Kernel::System::Email::SMTPS_OAuth2', 'SMTPS OAuth2'),
                        new TreeNode('Kernel::System::Email::SMTPTLS', 'SMTPTLS'),
                        new TreeNode('Kernel::System::Email::SMTPTLS_OAuth2', 'SMTPTLS OAuth2')
                    ]
                )
            ],
            null, null, null, null, null, null, null, null, null, null, null, null,
            typeReadonly
        );

        const sendMailModuleValue = sysconfigOptions.find((o) => o.Name === 'SendmailModule').Value ||
            sysconfigDefinitions.find((o) => o.Name === 'SendmailModule').Default;
        if (sendMailModuleValue?.startsWith('Kernel::System::Email::SMTP')) {
            const smtpFields = await this.getDefaultSMTPFields();
            if (sendMailModuleValue.match(/OAuth2/)) {
                smtpFields.unshift(await this.getProfileField());
            } else {
                smtpFields.push(await this.getPasswordField());
            }
            sendMailModuleField.children = smtpFields;
        }

        const typeGroup = new FormGroupConfiguration(
            'setup-sending-email-form-type-group', 'Translatable#Type', null, null, [sendMailModuleField]
        );

        const envelopeFromHint = sysconfigDefinitions.find((o) => o.Name === 'SendmailEnvelopeFrom').Description || '';
        const envelopeFromReadonly = sysconfigOptions.find((o) => o.Name === 'SendmailEnvelopeFrom').ReadOnly;
        const notificationFromHint = sysconfigDefinitions.find(
            (o) => o.Name === 'SendmailNotificationEnvelopeFrom'
        ).Description || '';
        const notificationFromReadonly = sysconfigOptions.find(
            (o) => o.Name === 'SendmailNotificationEnvelopeFrom'
        ).ReadOnly;
        const notificationFallbackFromHint = sysconfigDefinitions.find(
            (o) => o.Name === 'SendmailNotificationEnvelopeFrom::FallbackToEmailFrom'
        ).Description || '';
        const notificationFallbackFromReadonly = sysconfigOptions.find(
            (o) => o.Name === 'SendmailNotificationEnvelopeFrom::FallbackToEmailFrom'
        ).ReadOnly;
        const envelopeGroup = new FormGroupConfiguration(
            'setup-sending-email-form-envelope-group', 'Envelope', null, null,
            [
                new FormFieldConfiguration(
                    'SendmailEnvelopeFrom', 'Translatable#Envelope From', 'SendmailEnvelopeFrom',
                    null, false, envelopeFromHint,
                    null, null, null, null, null, null, null, null, null, null, null, null, null,
                    envelopeFromReadonly
                ),
                new FormFieldConfiguration(
                    'SendmailNotificationEnvelopeFrom', 'Translatable#Notification Envelope From',
                    'SendmailNotificationEnvelopeFrom', null, false, notificationFromHint,
                    null, null, null, null, null, null, null, null, null, null, null, null, null,
                    notificationFromReadonly
                ),
                new FormFieldConfiguration(
                    'SendmailNotificationEnvelopeFrom::FallbackToEmailFrom', 'Translatable#Notification Envelope From Fallback',
                    'SendmailNotificationEnvelopeFrom::FallbackToEmailFrom',
                    'default-select-input', false, notificationFallbackFromHint,
                    [
                        new FormFieldOption(
                            DefaultSelectInputFormOption.NODES,
                            [
                                new TreeNode(0, 'Translatable#No'),
                                new TreeNode(1, 'Translatable#Yes')
                            ]
                        )
                    ], null, null, null, null, null, null, null, null, null, null, null, null,
                    notificationFallbackFromReadonly
                )
            ]
        );

        const formGroups = [typeGroup, envelopeGroup];

        if (this.canUpdateSystemAddress) {
            const addessGroup = new FormGroupConfiguration(
                'setup-sending-email-form-address-group', 'Translatable#System address', null, null,
                [
                    new FormFieldConfiguration(
                        'setup-sending-email-form-field-email',
                        'Translatable#Email Address', SystemAddressProperty.NAME, null, true,
                        'Translatable#Helptext_Admin_SystemAddressCreate_Name', null, null, null, null, null, null,
                        null, null, null,
                        FormValidationService.EMAIL_REGEX, FormValidationService.EMAIL_REGEX_ERROR_MESSAGE
                    ),
                    new FormFieldConfiguration(
                        'setup-sending-email-form-field-name',
                        'Translatable#Display Name', SystemAddressProperty.REALNAME, null, true,
                        'Translatable#Helptext_Admin_SystemAddressCreate_DisplayName'
                    )
                ]
            );
            formGroups.push(addessGroup);
        }

        const form = new FormConfiguration(
            'setup-sending-email-form', 'Sending Email', null, KIXObjectType.ANY,
            true, FormContext.EDIT, null,
            [
                new FormPageConfiguration(
                    'setup-sending-email-form-page', null, null, true, false, formGroups
                )
            ]
        );

        this.subscriber = {
            eventSubscriberId: 'setup-sending-mail-subscriber',
            eventPublished: async (data: FormValuesChangedEventData, eventId: string): Promise<void> => {
                const changedValue = data.changedValues.find((cv) => cv[0]?.property === 'SendmailModule');
                if (changedValue) {
                    const context = ContextService.getInstance().getActiveContext();
                    const formInstance = await context?.getFormManager()?.getFormInstance();
                    if (changedValue[1].value) {
                        let value = changedValue[1].value;
                        if (Array.isArray(changedValue[1].value) && changedValue[1].value.length) {
                            value = changedValue[1].value[0];
                        }

                        await this.prepareSMTPFields(changedValue[0], value, formInstance);
                    }
                }
            }
        };
        EventService.getInstance().subscribe(FormEvent.VALUES_CHANGED, this.subscriber);

        FormService.getInstance().addForm(form);
        this.state.formId = form.id;

        const activeContext = ContextService.getInstance().getActiveContext();
        const contextFormId = await activeContext?.getFormManager()?.getFormId();
        if (contextFormId === this.state.formId) {
            const object = await activeContext.getObject();
            (await activeContext?.getFormManager()?.getFormInstance()).initFormInstance(form.id, object);
        } else {
            await activeContext?.getFormManager()?.setFormId(this.state.formId);
        }

        setTimeout(() => this.initFormValues(
            form.id,
            sendMailModuleValue?.startsWith('Kernel::System::Email::SMTP') ?
                [
                    ...this.configKeys,
                    'SendmailModule::Host',
                    'SendmailModule::Port',
                    'SendmailModule::AuthUser',
                    'SendmailModule::AuthPassword',
                    'SendmailModule::OAuth2_Profile'
                ] : undefined
        ), 100);
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(FormEvent.VALUES_CHANGED, this.subscriber);
    }

    private async prepareSMTPFields(
        typeField: FormFieldConfiguration, value: string, formInstance: FormInstance
    ): Promise<void> {
        if (value.startsWith('Kernel::System::Email::SMTP')) {
            if (!typeField?.children?.length) {
                const smtpFields = await this.getDefaultSMTPFields();
                await formInstance.addFieldChildren(typeField, smtpFields);
                await this.initFormValues(this.state.formId,
                    [
                        'SendmailModule::Host',
                        'SendmailModule::Port',
                        'SendmailModule::AuthUser'
                    ]
                );
            }
            if (value.match(/OAuth2/)) {
                // add profile field if not already present
                if (!typeField?.children.some((field) => field.property === 'SendmailModule::OAuth2_Profile')) {
                    const profileField = await this.getProfileField();
                    await formInstance.addFieldChildren(typeField, [profileField], undefined, true);
                    await this.initFormValues(this.state.formId, ['SendmailModule::OAuth2_Profile']);
                }
                // remove password profile field
                const passwordField = typeField.children.find((field) => field.property === 'SendmailModule::AuthPassword');
                if (passwordField) {
                    await formInstance.removeFormField(passwordField);
                }
            } else {
                // add password field if not already present
                if (!typeField?.children.some((field) => field.property === 'SendmailModule::AuthPassword')) {
                    const passwordField = await this.getPasswordField();
                    await formInstance.addFieldChildren(typeField, [passwordField], undefined);
                    await this.initFormValues(this.state.formId, ['SendmailModule::AuthPassword']);
                }
                // remove profile field
                const profileField = typeField.children.find((field) => field.property === 'SendmailModule::OAuth2_Profile');
                if (profileField) {
                    await formInstance.removeFormField(profileField);
                }
            }
        } else if (typeField?.children?.length) {
            const children = [...typeField.children];
            for (const c of children) {
                await formInstance.removeFormField(c);
            }
        }
    }

    private async initSystemAddress(): Promise<void> {
        if (this.state.isSetup) {
            let systemAddress: SystemAddress[];
            if (this.step?.result?.systemAddressId) {
                systemAddress = await KIXObjectService.loadObjects<SystemAddress>(
                    KIXObjectType.SYSTEM_ADDRESS, [this.step.result.systemAddressId]
                );
            } else {
                systemAddress = await KIXObjectService.loadObjects<SystemAddress>(
                    KIXObjectType.SYSTEM_ADDRESS, null,
                    new KIXObjectLoadingOptions(
                        [
                            new FilterCriteria(
                                SystemAddressProperty.NAME, SearchOperator.EQUALS,
                                FilterDataType.STRING, FilterType.AND, 'kix@localhost'
                            )
                        ]
                    )
                );
                if (Array.isArray(systemAddress) && !systemAddress.length) {
                    systemAddress = await KIXObjectService.loadObjects<SystemAddress>(
                        KIXObjectType.SYSTEM_ADDRESS, [1]
                    );
                }
            }

            if (Array.isArray(systemAddress) && systemAddress.length) {
                this.systemAddress = systemAddress[0];
                this.canUpdateSystemAddress = await AuthenticationSocketClient.getInstance().checkPermissions([
                    new UIComponentPermission(
                        `system/communication/systemaddresses/${this.systemAddress.ID}`, [CRUD.UPDATE],
                        true, null, false
                    )
                ]);
            }
        }
    }

    private async getDefaultSMTPFields(): Promise<FormFieldConfiguration[]> {
        const configKeys = [
            'SendmailModule::Host',
            'SendmailModule::Port',
            'SendmailModule::AuthUser'
        ];
        const sysconfigDefinitions = await KIXObjectService.loadObjects<SysConfigOptionDefinition>(
            KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, configKeys
        );
        const hostHint = sysconfigDefinitions.find((o) => o.Name === 'SendmailModule::Host')?.Description || '';
        const portHint = sysconfigDefinitions.find((o) => o.Name === 'SendmailModule::Port')?.Description || '';
        const userHint = sysconfigDefinitions.find((o) => o.Name === 'SendmailModule::AuthUser')?.Description || '';

        const sysconfigOptions = await KIXObjectService.loadObjects<SysConfigOption>(
            KIXObjectType.SYS_CONFIG_OPTION, configKeys
        );
        const hostReadonly = sysconfigOptions.find((o) => o.Name === 'SendmailModule::Host')?.ReadOnly;
        const portReadonly = sysconfigOptions.find((o) => o.Name === 'SendmailModule::Port')?.ReadOnly;
        const userReadonly = sysconfigOptions.find((o) => o.Name === 'SendmailModule::AuthUser')?.ReadOnly;

        return [
            new FormFieldConfiguration(
                'SendmailModule::Host', 'Translatable#Host', 'SendmailModule::Host', null, false, hostHint,
                null, null, null, null, null, null, null, null, null, null, null, null, null,
                hostReadonly
            ),
            new FormFieldConfiguration(
                'SendmailModule::Port', 'Translatable#Port', 'SendmailModule::Port', null, false, portHint,
                null, null, null, null, null, null, null, null, null, null, null, null, null,
                portReadonly
            ),
            new FormFieldConfiguration(
                'SendmailModule::AuthUser', 'Translatable#User', 'SendmailModule::AuthUser', null, false, userHint,
                null, null, null, null, null, null, null, null, null, null, null, null, null,
                userReadonly
            )
        ];
    }

    private async getPasswordField(): Promise<FormFieldConfiguration> {
        const sysconfigDefinitions = await KIXObjectService.loadObjects<SysConfigOptionDefinition>(
            KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, ['SendmailModule::AuthPassword']
        );
        const sysconfigOptions = await KIXObjectService.loadObjects<SysConfigOption>(
            KIXObjectType.SYS_CONFIG_OPTION, ['SendmailModule::AuthPassword']
        );
        const passwordHint = sysconfigDefinitions.find((o) => o.Name === 'SendmailModule::AuthPassword')?.Description || '';
        const passwordReadonly = sysconfigOptions.find((o) => o.Name === 'SendmailModule::AuthPassword')?.ReadOnly;
        return new FormFieldConfiguration(
            'SendmailModule::AuthPassword', 'Translatable#Password', 'SendmailModule::AuthPassword',
            null, false, passwordHint,
            [
                new FormFieldOption(FormFieldOptions.INPUT_FIELD_TYPE, InputFieldTypes.PASSWORD)
            ],
            null, null, null, null, null, null, null, null, null, null, null, null,
            passwordReadonly
        );
    }

    private async getProfileField(): Promise<FormFieldConfiguration> {
        const sysconfigDefinitions = await KIXObjectService.loadObjects<SysConfigOptionDefinition>(
            KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, ['SendmailModule::OAuth2_Profile']
        );
        const sysconfigOptions = await KIXObjectService.loadObjects<SysConfigOption>(
            KIXObjectType.SYS_CONFIG_OPTION, ['SendmailModule::OAuth2_Profile']
        );
        const profileHint = sysconfigDefinitions.find(
            (o) => o.Name === 'SendmailModule::OAuth2_Profile'
        )?.Description || '';
        const profileReadonly = sysconfigOptions.find(
            (o) => o.Name === 'SendmailModule::OAuth2_Profile'
        )?.ReadOnly;
        return new FormFieldConfiguration(
            'SendmailModule::OAuth2_Profile', 'Translatable#OAuth2 Profile', 'SendmailModule::OAuth2_Profile',
            'object-reference-input', true, profileHint,
            [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.OAUTH2_PROFILE),
                new FormFieldOption(ObjectReferenceOptions.USE_OBJECT_SERVICE, false),
                new FormFieldOption(ObjectReferenceOptions.TRANSLATABLE, false),
                new FormFieldOption(ObjectReferenceOptions.TEXT_AS_ID, true),
                new FormFieldOption(FormFieldOptions.INVALID_CLICKABLE, true)
            ],
            null, null, null, null, null, null, null, null, null, null, null, null,
            profileReadonly
        );
    }

    private async initFormValues(formId: string, configKeys: string[] = this.configKeys): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();

        const sysconfigOptions = await KIXObjectService.loadObjects<SysConfigOption>(
            KIXObjectType.SYS_CONFIG_OPTION, configKeys
        );

        const values: Array<[string, any]> = configKeys.map(
            (k) => [k, sysconfigOptions.find((o) => o.Name === k)?.Value]
        );

        if (this.systemAddress) {
            values.push(
                [SystemAddressProperty.NAME, this.systemAddress.Name],
                [SystemAddressProperty.REALNAME, this.systemAddress.Realname]
            );
        }

        formInstance.provideFormFieldValuesForProperties(values, null);
    }

    public async submit(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();

        const result = await formInstance.validateForm();
        const validationError = result.some((r) => r && r.severity === ValidationSeverity.ERROR);
        if (validationError) {
            BrowserUtil.showValidationError(result);
        } else {
            BrowserUtil.toggleLoadingShield('SETUP_SENDING_MAIL_SHIELD', true, 'Translatable#Save Outbox Settings');

            if (this.systemAddress && this.canUpdateSystemAddress) {
                await KIXObjectService.updateObjectByForm(
                    KIXObjectType.SYSTEM_ADDRESS, this.state.formId, this.systemAddress.ID
                ).catch(() => null);
            }

            await this.saveSysconfigValues(formInstance).catch(() => null);

            if (this.state.isSetup) {
                if (this.systemAddress && this.canUpdateSystemAddress) {
                    await SetupService.getInstance().stepCompleted(
                        this.step.id, { systemAddressId: this.systemAddress.ID }
                    );
                } else {
                    await SetupService.getInstance().stepCompleted(this.step.id, null);
                }
            }

            BrowserUtil.toggleLoadingShield('SETUP_SENDING_MAIL_SHIELD', false);
        }
    }

    private async saveSysconfigValues(formInstance: FormInstance): Promise<void> {
        const values: Array<[string, any]> = [];

        const formFieldValues = formInstance.getAllFormFieldValues();
        formFieldValues.forEach((value: FormFieldValue, key: string) => {
            const field = formInstance.getFormField(key);
            if (
                field &&
                field.property !== SystemAddressProperty.NAME &&
                field.property !== SystemAddressProperty.REALNAME
            ) {
                const v = Array.isArray(value.value) ? value.value[0] : value.value;
                values.push([field.property, v]);
            }
        });

        for (const value of values) {
            await KIXObjectService.updateObject(
                KIXObjectType.SYS_CONFIG_OPTION,
                [
                    [SysConfigOptionProperty.VALUE, value[1]],
                    [KIXObjectProperty.VALID_ID, value[1] !== '' && value[1] !== null ? 1 : 2]
                ],
                value[0]
            );
        }
    }

    public skip(): void {
        SetupService.getInstance().stepSkipped(this.step.id);
    }

}

module.exports = Component;
