/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { EditMailFilterDialogContext } from './webapp/core';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { HelpWidgetConfiguration } from '../../model/configuration/HelpWidgetConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ConfigurationDefinition } from '../../model/configuration/ConfigurationDefinition';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredWidget } from '../../model/configuration/ConfiguredWidget';
import { ConfiguredDialogWidget } from '../../model/configuration/ConfiguredDialogWidget';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { ContextMode } from '../../model/ContextMode';
import { FormFieldConfiguration } from '../../model/configuration/FormFieldConfiguration';
import { MailFilterProperty } from './model/MailFilterProperty';
import { FormFieldValue } from '../../model/configuration/FormFieldValue';
import { KIXObjectProperty } from '../../model/kix/KIXObjectProperty';
import { FormFieldOption } from '../../model/configuration/FormFieldOption';
import { ObjectReferenceOptions } from '../../modules/base-components/webapp/core/ObjectReferenceOptions';
import { FormGroupConfiguration } from '../../model/configuration/FormGroupConfiguration';
import { FormPageConfiguration } from '../../model/configuration/FormPageConfiguration';
import { FormConfiguration } from '../../model/configuration/FormConfiguration';
import { FormContext } from '../../model/configuration/FormContext';

import { ModuleConfigurationService } from '../../server/services/configuration/ModuleConfigurationService';

import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditMailFilterDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const helpConfig = new HelpWidgetConfiguration(
            'mail-filter-edit-dialog-help-widget-config', 'Help Config', ConfigurationType.HelpWidget,
            'Translatable#Helptext_Admin_MailFilter_Sidebar', []
        );
        configurations.push(helpConfig);

        const filterHelpSidebar = new WidgetConfiguration(
            'mail-filter-edit-dialog-help-widget', 'Widget', ConfigurationType.Widget,
            'help-widget', null, [],
            new ConfigurationDefinition('mail-filter-edit-dialog-help-widget-config', ConfigurationType.HelpWidget),
            null, false, true, 'kix-icon-query'
        );
        configurations.push(filterHelpSidebar);

        const dialogWidget = new WidgetConfiguration(
            'mail-filter-edit-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'object-dialog-form-widget', 'Translatable#Edit Email Filter',
            [], null, null, false, false, 'kix-icon-edit'
        );
        configurations.push(dialogWidget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
                this.getModuleId(),
                [
                    new ConfiguredWidget('mail-filter-edit-dialog-help-widget', 'mail-filter-edit-dialog-help-widget')
                ],
                [], [],
                [
                    new ConfiguredDialogWidget(
                        'mail-filter-edit-dialog-widget', 'mail-filter-edit-dialog-widget',
                        KIXObjectType.MAIL_FILTER, ContextMode.EDIT_ADMIN
                    )
                ], [], [], [], []
            )
        );
        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const formId = 'mail-filter-edit-form';
        const configurations = [];

        configurations.push(
            new FormFieldConfiguration(
                'mail-filter-edit-form-group-name',
                'Translatable#Name', MailFilterProperty.NAME, null, true,
                'Translatable#Helptext_Admin_MailFilterCreate_Name'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'mail-filter-edit-form-group-stop-after-match',
                'Translatable#Stop after match', MailFilterProperty.STOP_AFTER_MATCH, 'checkbox-input', false,
                'Translatable#Helptext_Admin_MailFilterCreate_StopAfterMatch', undefined,
                new FormFieldValue(false)
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'mail-filter-edit-form-group-comment',
                'Translatable#Comment', KIXObjectProperty.COMMENT, 'text-area-input', false,
                'Translatable#Helptext_Admin_MailFilterCreate_Comment', null, null, null,
                null, null, null, null, null, 250
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'mail-filter-edit-form-group-valid',
                'Translatable#Validity', KIXObjectProperty.VALID_ID,
                'object-reference-input', true, 'Translatable#Helptext_Admin_MailFilterCreate_Validity',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
                ],
                new FormFieldValue(1)
            )
        );

        configurations.push(
            new FormGroupConfiguration(
                'mail-filter-edit-form-group-information', 'Translatable#Email Filter Information',
                [
                    'mail-filter-edit-form-group-name',
                    'mail-filter-edit-form-group-stop-after-match',
                    'mail-filter-edit-form-group-comment',
                    'mail-filter-edit-form-group-valid',
                ]
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'mail-filter-edit-form-field-conditions',
                'Translatable#Filter Conditions', MailFilterProperty.MATCH, 'mail-filter-match-form-input', true,
                'Translatable#Helptext_Admin_MailFilterCreate_FilterConditions', undefined, undefined,
                undefined, undefined, undefined, undefined, undefined, undefined, undefined, null,
                undefined, undefined, undefined, undefined, undefined, undefined, false
            )
        );

        configurations.push(
            new FormGroupConfiguration(
                'mail-filter-edit-form-group-conditions', 'Translatable#Filter Conditions',
                [
                    'mail-filter-edit-form-field-conditions',
                ]
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'mail-filter-edit-form-field-headers',
                'Translatable#Set Email Headers', MailFilterProperty.SET, 'mail-filter-set-form-input', true,
                'Translatable#Helptext_Admin_MailFilterCreate_SetEmailHeaders', undefined, undefined,
                undefined, undefined, undefined, undefined, undefined, undefined, undefined, null,
                undefined, undefined, undefined, undefined, undefined, undefined, false
            )
        );

        configurations.push(
            new FormGroupConfiguration(
                'mail-filter-edit-form-group-headers', 'Translatable#Set Email Headers',
                [
                    'mail-filter-edit-form-field-headers',
                ]
            )
        );

        configurations.push(
            new FormPageConfiguration(
                'mail-filter-edit-form-page', 'Translatable#New Email Filter',
                [
                    'mail-filter-edit-form-group-information',
                    'mail-filter-edit-form-group-conditions',
                    'mail-filter-edit-form-group-headers'
                ]
            )
        );

        configurations.push(
            new FormConfiguration(
                formId, 'Translatable#New Email Filter',
                ['mail-filter-edit-form-page'],
                KIXObjectType.MAIL_FILTER, true, FormContext.EDIT
            )
        );
        ModuleConfigurationService.getInstance().registerForm([FormContext.EDIT], KIXObjectType.MAIL_FILTER, formId);

        return configurations;
    }
}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
