/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { EditMailAccountDialogContext } from './webapp/core';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredDialogWidget } from '../../model/configuration/ConfiguredDialogWidget';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { ContextMode } from '../../model/ContextMode';
import { FormFieldConfiguration } from '../../model/configuration/FormFieldConfiguration';
import { MailAccountProperty } from './model/MailAccountProperty';
import { FormFieldOption } from '../../model/configuration/FormFieldOption';
import { FormFieldValue } from '../../model/configuration/FormFieldValue';
import { ObjectReferenceOptions } from '../../modules/base-components/webapp/core/ObjectReferenceOptions';
import { KIXObjectProperty } from '../../model/kix/KIXObjectProperty';
import { FormGroupConfiguration } from '../../model/configuration/FormGroupConfiguration';
import { FormPageConfiguration } from '../../model/configuration/FormPageConfiguration';
import { FormConfiguration } from '../../model/configuration/FormConfiguration';
import { FormContext } from '../../model/configuration/FormContext';
import { ModuleConfigurationService } from '../../server/services/configuration/ModuleConfigurationService';

import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditMailAccountDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const dialogWidget = new WidgetConfiguration(
            'mail-account-edit-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'object-dialog-form-widget', 'Translatable#Edit Account',
            [], null, null, false, false, 'kix-icon-edit'
        );
        configurations.push(dialogWidget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
                this.getModuleId(), [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'mail-account-edit-dialog-widget', 'mail-account-edit-dialog-widget',
                        KIXObjectType.MAIL_ACCOUNT, ContextMode.EDIT_ADMIN
                    )
                ], [], [], [], []
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
                'mail-account-edit-form-field-type',
                'Translatable#Type', MailAccountProperty.TYPE, 'mail-account-input-types',
                true, 'Translatable#Helptext_Admin_MailAccountCreate_Type.'
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
                'mail-account-edit-form-field-accept-header',
                'Translatable#Accept KIX Header', MailAccountProperty.TRUSTED, 'checkbox-input', false,
                'Translatable#Helptext_Admin_MailAccountCreate_AcceptKIXHeader', undefined,
                new FormFieldValue(false)
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'mail-account-edit-form-field-dispatching',
                'Translatable#Dispatching', MailAccountProperty.DISPATCHING_BY, 'mail-account-input-dispatching',
                true, 'Translatable#Helptext_Admin_MailAccountCreate_Dispachting'
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
                    'mail-account-edit-form-field-type',
                    'mail-account-edit-form-field-host',
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
        ModuleConfigurationService.getInstance().registerForm([FormContext.EDIT], KIXObjectType.MAIL_ACCOUNT, formId);

        return configurations;
    }
}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
