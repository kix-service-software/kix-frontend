/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../core/extensions';
import { NewMailAccountDialogContext } from '../../core/browser/mail-account';
import {
    ConfiguredWidget, FormFieldValue, MailAccountProperty,
    KIXObjectType, FormContext, ContextConfiguration, FormFieldOption, FormFieldOptions, InputFieldTypes,
    KIXObjectProperty,
    ObjectReferenceOptions,
    DispatchingType,
    TreeNode,
    KIXObjectLoadingOptions,
    FilterCriteria,
    QueueProperty,
    FilterType,
    FilterDataType,
    ContextMode,
    ConfiguredDialogWidget,
    WidgetConfiguration
} from '../../core/model';
import { ConfigurationService } from '../../core/services';
import {
    FormGroupConfiguration, FormConfiguration, FormFieldConfiguration, FormPageConfiguration
} from '../../core/model/components/form/configuration';
import { SearchOperator } from '../../core/browser';
import { ConfigurationType } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewMailAccountDialogContext.CONTEXT_ID;
    }

    public async createDefaultConfiguration(): Promise<ContextConfiguration> {

        const dialogWidget = new WidgetConfiguration(
            'mail-account-new-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'new-mail-account-dialog', 'Translatable#New Account',
            [], null, null, false, false, 'kix-icon-new-gear'
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(dialogWidget);

        return new ContextConfiguration(
            this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
            this.getModuleId(), [], [], [], [], [], [], [], [],
            [
                new ConfiguredDialogWidget(
                    'mail-account-new-dialog-widget', 'mail-account-new-dialog-widget',
                    KIXObjectType.MAIL_ACCOUNT, ContextMode.CREATE_ADMIN
                )
            ]
        );
    }

    public async createFormConfigurations(overwrite: boolean): Promise<void> {

        const formId = 'mail-account-new-form';

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'mail-account-new-form-field-username',
                'Translatable#User Name', MailAccountProperty.LOGIN, null, true,
                'Translatable#Helptext_Admin_MailAccountCreate_UserName'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'mail-account-new-form-field-password',
                'Translatable#Password', MailAccountProperty.PASSWORD, null, true,
                'Translatable#Helptext_Admin_MailAccountCreate_Password',
                [
                    new FormFieldOption(FormFieldOptions.INPUT_FIELD_TYPE, InputFieldTypes.PASSWORD)
                ]
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'mail-account-new-form-field-host',
                'Translatable#Host', MailAccountProperty.HOST, null, true,
                'Translatable#Helptext_Admin_MailAccountCreate_Host'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'mail-account-new-form-field-type',
                'Translatable#Type', MailAccountProperty.TYPE, 'mail-account-input-types',
                true, 'Translatable#Helptext_Admin_MailAccountCreate_Type.'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'mail-account-new-form-field-accept-header',
                'Translatable#Accept KIX Header', MailAccountProperty.TRUSTED, 'checkbox-input', true,
                'Translatable#Helptext_Admin_MailAccountCreate_AcceptKIXHeader', undefined,
                new FormFieldValue(false)
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'mail-account-new-form-field-dispatching',
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
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'mail-account-new-form-field-comment',
                'Translatable#Comment', MailAccountProperty.COMMENT, 'text-area-input', false,
                'Translatable#Helptext_Admin_MailAccountCreate_Comment', null, null, null,
                null, null, null, null, null, 250
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'mail-account-new-form-field-valid',
                'Translatable#Validity', KIXObjectProperty.VALID_ID,
                'object-reference-input', true, 'Translatable#Helptext_Admin_MailAccountCreate_Validity',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
                ],
                new FormFieldValue(1)
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormGroupConfiguration(
                'mail-account-new-form-group-information', 'Translatable#Email Account',
                [
                    'mail-account-new-form-field-username',
                    'mail-account-new-form-field-password',
                    'mail-account-new-form-field-host',
                    'mail-account-new-form-field-type',
                    'mail-account-new-form-field-accept-header',
                    'mail-account-new-form-field-dispatching',
                    'mail-account-new-form-field-comment',
                    'mail-account-new-form-field-valid'
                ]
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormPageConfiguration(
                'mail-account-new-form-page', 'Translatable#New Account',
                ['mail-account-new-form-group-information']
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormConfiguration(
                formId, 'Translatable#New Account',
                ['mail-account-new-form-page'],
                KIXObjectType.MAIL_ACCOUNT
            )
        );
        ConfigurationService.getInstance().registerForm([FormContext.NEW], KIXObjectType.MAIL_ACCOUNT, formId);
    }
}

module.exports = (data, host, options) => {
    return new Extension();
};
