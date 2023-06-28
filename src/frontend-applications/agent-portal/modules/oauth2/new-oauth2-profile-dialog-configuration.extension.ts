/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { NewOAuth2ProfileDialogContext } from './webapp/core';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredDialogWidget } from '../../model/configuration/ConfiguredDialogWidget';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { ContextMode } from '../../model/ContextMode';
import { FormFieldConfiguration } from '../../model/configuration/FormFieldConfiguration';
import { OAuth2ProfileProperty } from './model/OAuth2ProfileProperty';
import { FormFieldOption } from '../../model/configuration/FormFieldOption';
import { FormFieldOptions } from '../../model/configuration/FormFieldOptions';
import { InputFieldTypes } from '../base-components/webapp/core/InputFieldTypes';
import { FormFieldValue } from '../../model/configuration/FormFieldValue';
import { ObjectReferenceOptions } from '../base-components/webapp/core/ObjectReferenceOptions';
import { KIXObjectProperty } from '../../model/kix/KIXObjectProperty';
import { FormGroupConfiguration } from '../../model/configuration/FormGroupConfiguration';
import { FormPageConfiguration } from '../../model/configuration/FormPageConfiguration';
import { FormConfiguration } from '../../model/configuration/FormConfiguration';
import { FormContext } from '../../model/configuration/FormContext';
import { ModuleConfigurationService } from '../../server/services/configuration/ModuleConfigurationService';

import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewOAuth2ProfileDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {

        const configurations = [];

        const dialogWidget = new WidgetConfiguration(
            'oauth2-profile-new-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'object-dialog-form-widget', 'Translatable#New Profile',
            [], null, null, false, false, 'kix-icon-new-gear'
        );
        configurations.push(dialogWidget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
                this.getModuleId(), [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'oauth2-profile-new-dialog-widget', 'oauth2-profile-new-dialog-widget',
                        KIXObjectType.OAUTH2_PROFILE, ContextMode.CREATE_ADMIN
                    )
                ], [], [], [], []
            )
        );
        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const configurations = [];
        const formId = 'oauth2-profile-new-form';

        configurations.push(
            new FormFieldConfiguration(
                'oauth2-profile-new-form-field-name',
                'Translatable#Name', OAuth2ProfileProperty.NAME, null, true,
                'Translatable#Helptext_Admin_OAuth2ProfileCreate_Name'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'oauth2-profile-new-form-field-url-auth',
                'Translatable#Authorization URL', OAuth2ProfileProperty.URL_AUTH, null, true,
                'Translatable#Helptext_Admin_OAuth2ProfileCreate_URL_Auth'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'oauth2-profile-new-form-field-url-token',
                'Translatable#Token URL', OAuth2ProfileProperty.URL_TOKEN, null, true,
                'Translatable#Helptext_Admin_OAuth2ProfileCreate_URL_Token'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'oauth2-profile-new-form-field-url-redirect',
                'Translatable#Redirect URL', OAuth2ProfileProperty.URL_REDIRECT, null, true,
                'Translatable#Helptext_Admin_OAuth2ProfileCreate_URL_Redirect', undefined,
                new FormFieldValue('https://<YOUR_FRONTEND_HOST>/oauth2redirect')
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'oauth2-profile-new-form-field-client-id',
                'Translatable#Client ID', OAuth2ProfileProperty.CLIENT_ID, null, true,
                'Translatable#Helptext_Admin_OAuth2ProfileCreate_Client_ID'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'oauth2-profile-new-form-field-client-secret',
                'Translatable#Client Secret', OAuth2ProfileProperty.CLIENT_SECRET, null, true,
                'Translatable#Helptext_Admin_OAuth2ProfileCreate_Client_Secret.',
                [
                    new FormFieldOption(FormFieldOptions.INPUT_FIELD_TYPE, InputFieldTypes.PASSWORD)
                ]
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'oauth2-profile-new-form-field-url-scope',
                'Translatable#Scope', OAuth2ProfileProperty.SCOPE, null, true,
                'Translatable#Helptext_Admin_OAuth2ProfileCreate_Scope'
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'oauth2-profile-new-form-field-valid',
                'Translatable#Validity', KIXObjectProperty.VALID_ID, 'object-reference-input', true,
                'Translatable#Helptext_Admin_OAuth2ProfileCreate_Validity',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
                ],
                new FormFieldValue(1)
            )
        );

        configurations.push(
            new FormGroupConfiguration(
                'oauth2-profile-new-form-group-information', 'Translatable#OAuth2 Profile',
                [
                    'oauth2-profile-new-form-field-name',
                    'oauth2-profile-new-form-field-url-auth',
                    'oauth2-profile-new-form-field-url-token',
                    'oauth2-profile-new-form-field-url-redirect',
                    'oauth2-profile-new-form-field-client-id',
                    'oauth2-profile-new-form-field-client-secret',
                    'oauth2-profile-new-form-field-url-scope',
                    'oauth2-profile-new-form-field-valid'
                ]
            )
        );

        configurations.push(
            new FormPageConfiguration(
                'oauth2-profile-new-form-page', 'Translatable#New Profile',
                ['oauth2-profile-new-form-group-information']
            )
        );

        configurations.push(
            new FormConfiguration(
                formId, 'Translatable#New Profile',
                ['oauth2-profile-new-form-page'],
                KIXObjectType.OAUTH2_PROFILE
            )
        );
        ModuleConfigurationService.getInstance().registerForm(
            [FormContext.NEW], KIXObjectType.OAUTH2_PROFILE, formId
        );

        return configurations;
    }
}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
