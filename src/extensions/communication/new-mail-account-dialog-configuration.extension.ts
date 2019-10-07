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
    ConfiguredWidget, FormField, FormFieldValue, MailAccountProperty, Form,
    KIXObjectType, FormContext, ContextConfiguration, FormFieldOption, FormFieldOptions, InputFieldTypes,
    KIXObjectProperty,
    ObjectReferenceOptions,
    DispatchingType,
    TreeNode,
    KIXObjectLoadingOptions,
    FilterCriteria,
    QueueProperty,
    FilterType,
    FilterDataType
} from '../../core/model';
import { ConfigurationService } from '../../core/services';
import { FormGroup } from '../../core/model/components/form/FormGroup';
import { SearchOperator } from '../../core/browser';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewMailAccountDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const sidebars = [];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [];

        return new ContextConfiguration(this.getModuleId(), sidebars, sidebarWidgets);
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const formId = 'new-mail-account-form';
        const existing = configurationService.getConfiguration(formId);
        if (!existing) {
            const group = new FormGroup('Translatable#Email Account', [
                new FormField(
                    'Translatable#User Name', MailAccountProperty.LOGIN, null, true,
                    'Translatable#Helptext_Admin_MailAccountCreate_UserName'
                ),
                new FormField(
                    'Translatable#Password', MailAccountProperty.PASSWORD, null, true,
                    'Translatable#Helptext_Admin_MailAccountCreate_Password',
                    [
                        new FormFieldOption(FormFieldOptions.INPUT_FIELD_TYPE, InputFieldTypes.PASSWORD)
                    ]
                ),
                new FormField(
                    'Translatable#Host', MailAccountProperty.HOST, null, true,
                    'Translatable#Helptext_Admin_MailAccountCreate_Host'
                ),
                new FormField(
                    'Translatable#Type', MailAccountProperty.TYPE, 'mail-account-input-types',
                    true, 'Translatable#Helptext_Admin_MailAccountCreate_Type.'
                ),
                new FormField(
                    'Translatable#Accept KIX Header', MailAccountProperty.TRUSTED, 'checkbox-input', true,
                    'Translatable#Helptext_Admin_MailAccountCreate_AcceptKIXHeader', undefined,
                    new FormFieldValue(false)
                ),
                new FormField(
                    'Translatable#Dispatching', MailAccountProperty.DISPATCHING_BY, 'object-reference-input',
                    true, 'Translatable#Helptext_Admin_MailAccountCreate_Dispachting', [
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
                ),
                new FormField(
                    'Translatable#Comment', MailAccountProperty.COMMENT, 'text-area-input', false,
                    'Translatable#Helptext_Admin_MailAccountCreate_Comment', null, null, null,
                    null, null, null, null, 250
                ),
                new FormField(
                    'Translatable#Validity', KIXObjectProperty.VALID_ID,
                    'object-reference-input', true, 'Translatable#Helptext_Admin_MailAccountCreate_Validity', [
                        new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
                    ], new FormFieldValue(1)
                )
            ]);

            const form = new Form(formId, 'Translatable#New Account', [group], KIXObjectType.MAIL_ACCOUNT);
            await configurationService.saveConfiguration(form.id, form);
        }
        configurationService.registerForm([FormContext.NEW], KIXObjectType.MAIL_ACCOUNT, formId);
    }
}

module.exports = (data, host, options) => {
    return new Extension();
};
