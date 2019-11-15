/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../core/extensions';
import { EditMailAccountDialogContext } from '../../core/browser/mail-account';
import {
    FormFieldValue, MailAccountProperty,
    KIXObjectType, FormContext, ContextConfiguration, FormFieldOption, FormFieldOptions, InputFieldTypes,
    KIXObjectProperty, ObjectReferenceOptions, KIXObjectLoadingOptions, FilterCriteria, QueueProperty,
    FilterDataType, FilterType, DispatchingType, TreeNode, WidgetConfiguration, ConfiguredDialogWidget, ContextMode
} from '../../core/model';
import { ConfigurationService } from '../../core/services';
import {
    FormGroupConfiguration, FormConfiguration, FormFieldConfiguration, FormPageConfiguration
} from '../../core/model/components/form/configuration';
import { SearchOperator } from '../../core/browser';
import { ConfigurationType, IConfiguration } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditMailAccountDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const dialogWidget = new WidgetConfiguration(
            'mail-account-edit-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'edit-mail-account-dialog', 'Translatable#Edit Account',
            [], null, null, false, false, 'kix-icon-edit'
        );
        configurations.push(dialogWidget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
                this.getModuleId(), [], [], [], [], [], [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'mail-account-edit-dialog-widget', 'mail-account-edit-dialog-widget',
                        KIXObjectType.MAIL_ACCOUNT, ContextMode.EDIT_ADMIN
                    )
                ]
            )
        );

        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const configurations = [];
        const formId = 'mail-account-edit-form';

        configurations.push(
            new FormFieldConfiguration(
                'mail-account-edit-form-field-username',
                'Translatable#User Name', MailAccountProperty.LOGIN, null, true,
                'Translatable#Helptext_Admin_MailAccountCreate_UserName'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'mail-account-edit-form-field-password',
                'Translatable#Password', MailAccountProperty.PASSWORD, null, true,
                'Translatable#Helptext_Admin_MailAccountCreate_Password',
                [
                    new FormFieldOption(FormFieldOptions.INPUT_FIELD_TYPE, InputFieldTypes.PASSWORD)
                ]
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'mail-account-edit-form-field-host',
                'Translatable#Host', MailAccountProperty.HOST, null, true,
                'Translatable#Helptext_Admin_MailAccountCreate_Host'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'mail-account-edit-form-field-type',
                'Translatable#Type', MailAccountProperty.TYPE, 'mail-account-input-types',
                true, 'Translatable#Helptext_Admin_MailAccountCreate_Type.'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'mail-account-edit-form-field-accept-header',
                'Translatable#Accept KIX Header', MailAccountProperty.TRUSTED, 'checkbox-input', true,
                'Translatable#Helptext_Admin_MailAccountCreate_AcceptKIXHeader', undefined,
                new FormFieldValue(false)
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'mail-account-edit-form-field-dispatching',
                'Translatable#Dispatching', MailAccountProperty.DISPATCHING_BY, 'object-reference-input',
                true, 'Translatable#Helptext_Admin_MailAccountCreate_Dispachting',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.QUEUE),
                    new FormFieldOption(ObjectReferenceOptions.AS_STRUCTURE, true),
                    new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                        new KIXObjectLoadingOptions(
                            [
                                new FilterCriteria(
                                    QueueProperty.PARENT_ID, SearchOperator.EQUALS, FilterDataType.STRING,
                                    FilterType.AND, null
                                )
                            ],
                            null, null,
                            [QueueProperty.SUB_QUEUES, 'TicketStats', 'Tickets'],
                            [QueueProperty.SUB_QUEUES]
                        )
                    ),
                    new FormFieldOption(ObjectReferenceOptions.ADDITIONAL_NODES, [
                        new TreeNode(DispatchingType.FRONTEND_KEY_DEFAULT, 'Translatable#Default'),
                    ])
                ]
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'mail-account-edit-form-field-comment',
                'Translatable#Comment', MailAccountProperty.COMMENT, 'text-area-input', false,
                'Translatable#Helptext_Admin_MailAccountCreate_Comment', null, null, null,
                null, null, null, null, null, 250
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'mail-account-edit-form-field-valid',
                'Translatable#Validity', KIXObjectProperty.VALID_ID,
                'object-reference-input', true, 'Translatable#Helptext_Admin_MailAccountCreate_Validity',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
                ],
                new FormFieldValue(1)
            )
        );

        configurations.push(
            new FormGroupConfiguration(
                'mail-account-edit-form-group-information', 'Translatable#Email Account',
                [
                    'mail-account-edit-form-field-username',
                    'mail-account-edit-form-field-password',
                    'mail-account-edit-form-field-host',
                    'mail-account-edit-form-field-type',
                    'mail-account-edit-form-field-accept-header',
                    'mail-account-edit-form-field-dispatching',
                    'mail-account-edit-form-field-comment',
                    'mail-account-edit-form-field-valid'
                ]
            )
        );

        configurations.push(
            new FormPageConfiguration(
                'mail-account-edit-form-page', 'Translatable#Edit Account',
                ['mail-account-edit-form-group-information']
            )
        );

        configurations.push(
            new FormConfiguration(
                formId, 'Translatable#Edit Account',
                ['mail-account-edit-form-page'],
                KIXObjectType.MAIL_ACCOUNT, true, FormContext.EDIT
            )
        );
        ConfigurationService.getInstance().registerForm([FormContext.EDIT], KIXObjectType.MAIL_ACCOUNT, formId);

        return configurations;
    }
}

module.exports = (data, host, options) => {
    return new Extension();
};
