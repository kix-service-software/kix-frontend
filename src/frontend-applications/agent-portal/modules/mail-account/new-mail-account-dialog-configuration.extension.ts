/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { NewMailAccountDialogContext } from './webapp/core';
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
import { FormFieldOptions } from '../../model/configuration/FormFieldOptions';
import { FormFieldValue } from '../../model/configuration/FormFieldValue';
import { ObjectReferenceOptions } from '../../modules/base-components/webapp/core/ObjectReferenceOptions';
import { KIXObjectLoadingOptions } from '../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../model/FilterCriteria';
import { SearchOperator } from '../search/model/SearchOperator';
import { FilterDataType } from '../../model/FilterDataType';
import { FilterType } from '../../model/FilterType';
import { TreeNode } from '../base-components/webapp/core/tree';
import { DispatchingType } from './model/DispatchingType';
import { KIXObjectProperty } from '../../model/kix/KIXObjectProperty';
import { FormGroupConfiguration } from '../../model/configuration/FormGroupConfiguration';
import { FormPageConfiguration } from '../../model/configuration/FormPageConfiguration';
import { FormConfiguration } from '../../model/configuration/FormConfiguration';
import { FormContext } from '../../model/configuration/FormContext';
import { ModuleConfigurationService } from '../../server/services/configuration/ModuleConfigurationService';
import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewMailAccountDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {

        const configurations = [];

        const dialogWidget = new WidgetConfiguration(
            'mail-account-new-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'object-dialog-form-widget', 'Translatable#New Account',
            [], null, null, false, false, 'kix-icon-new-gear'
        );
        configurations.push(dialogWidget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
                this.getModuleId(), [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'mail-account-new-dialog-widget', 'mail-account-new-dialog-widget',
                        KIXObjectType.MAIL_ACCOUNT, ContextMode.CREATE_ADMIN
                    )
                ], [], [], [], []
            )
        );
        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const configurations = [];
        const formId = 'mail-account-new-form';
        configurations.push(
            new FormFieldConfiguration(
                'mail-account-new-form-field-username',
                'Translatable#User Name', MailAccountProperty.LOGIN, null, true,
                'Translatable#Helptext_Admin_MailAccountCreate_UserName'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'mail-account-new-form-field-type',
                'Translatable#Type', MailAccountProperty.TYPE, 'mail-account-input-types',
                true, 'Translatable#Helptext_Admin_MailAccountCreate_Type.'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'mail-account-new-form-field-host',
                'Translatable#Host', MailAccountProperty.HOST, null, true,
                'Translatable#Helptext_Admin_MailAccountCreate_Host'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'mail-account-new-form-field-accept-header',
                'Translatable#Accept KIX Header', MailAccountProperty.TRUSTED, 'checkbox-input', true,
                'Translatable#Helptext_Admin_MailAccountCreate_AcceptKIXHeader', undefined,
                new FormFieldValue(false)
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'mail-account-new-form-field-dispatching',
                'Translatable#Dispatching', MailAccountProperty.DISPATCHING_BY, 'object-reference-input',
                true, 'Translatable#Helptext_Admin_MailAccountCreate_Dispachting',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.QUEUE),
                    new FormFieldOption(ObjectReferenceOptions.USE_OBJECT_SERVICE, true),
                    new FormFieldOption(FormFieldOptions.INVALID_CLICKABLE, true),
                    new FormFieldOption(ObjectReferenceOptions.ADDITIONAL_NODES, [
                        new TreeNode(DispatchingType.FRONTEND_KEY_DEFAULT, 'Translatable#Default'),
                    ])
                ]
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'mail-account-new-form-field-comment',
                'Translatable#Comment', MailAccountProperty.COMMENT, 'text-area-input', false,
                'Translatable#Helptext_Admin_MailAccountCreate_Comment', null, null, null,
                null, null, null, null, null, 250
            )
        );

        configurations.push(
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

        configurations.push(
            new FormGroupConfiguration(
                'mail-account-new-form-group-information', 'Translatable#Email Account',
                [
                    'mail-account-new-form-field-username',
                    'mail-account-new-form-field-type',
                    'mail-account-new-form-field-host',
                    'mail-account-new-form-field-accept-header',
                    'mail-account-new-form-field-dispatching',
                    'mail-account-new-form-field-comment',
                    'mail-account-new-form-field-valid'
                ]
            )
        );

        configurations.push(
            new FormPageConfiguration(
                'mail-account-new-form-page', 'Translatable#New Account',
                ['mail-account-new-form-group-information']
            )
        );

        configurations.push(
            new FormConfiguration(
                formId, 'Translatable#New Account',
                ['mail-account-new-form-page'],
                KIXObjectType.MAIL_ACCOUNT
            )
        );
        ModuleConfigurationService.getInstance().registerForm([FormContext.NEW], KIXObjectType.MAIL_ACCOUNT, formId);

        return configurations;
    }
}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
