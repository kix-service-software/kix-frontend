/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../core/extensions';
import {
    ConfiguredWidget, FormFieldValue, MailFilterProperty,
    KIXObjectType, FormContext, ContextConfiguration, KIXObjectProperty,
    WidgetConfiguration, ObjectReferenceOptions, FormFieldOption, HelpWidgetConfiguration,
    ContextMode, ConfiguredDialogWidget
} from '../../core/model';
import { ConfigurationService } from '../../core/services';
import {
    FormGroupConfiguration, FormConfiguration, FormFieldConfiguration, FormPageConfiguration
} from '../../core/model/components/form/configuration';
import { NewMailFilterDialogContext } from '../../core/browser/mail-filter';
import { ConfigurationType, ConfigurationDefinition, IConfiguration } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewMailFilterDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const helpConfig = new HelpWidgetConfiguration(
            'mail-filter-new-dialog-help-widget-config', 'Help Config', ConfigurationType.HelpWidget,
            'Translatable#Helptext_Admin_MailFilter_Sidebar', []
        );
        configurations.push(helpConfig);

        const filterHelpSidebar = new WidgetConfiguration(
            'mail-filter-new-dialog-help-widget', 'Widget', ConfigurationType.Widget,
            'help-widget', null, [],
            new ConfigurationDefinition('mail-filter-new-dialog-help-widget-config', ConfigurationType.HelpWidget),
            null, false, false, 'kix-icon-query'
        );
        configurations.push(filterHelpSidebar);

        const dialogWidget = new WidgetConfiguration(
            'mail-filter-new-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'new-mail-filter-dialog', 'Translatable#New Email Filter',
            [], null, null, false, false, 'kix-icon-new-gear'
        );
        configurations.push(dialogWidget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
                this.getModuleId(),
                [
                    new ConfiguredWidget('mail-filter-new-dialog-help-widget', 'mail-filter-new-dialog-help-widget')
                ],
                [], [], [], [], [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'mail-filter-new-dialog-widget', 'mail-filter-new-dialog-widget',
                        KIXObjectType.MAIL_FILTER, ContextMode.CREATE_ADMIN
                    )
                ]
            )
        );

        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const formId = 'mail-filter-new-form';
        const configurations = [];
        configurations.push(
            new FormFieldConfiguration(
                'mail-filter-new-form-group-name',
                'Translatable#Name', MailFilterProperty.NAME, null, true,
                'Translatable#Helptext_Admin_MailFilterCreate_Name'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'mail-filter-new-form-group-stop-after-match',
                'Translatable#Stop after match', MailFilterProperty.STOP_AFTER_MATCH, 'checkbox-input', true,
                'Translatable#Helptext_Admin_MailFilterCreate_StopAfterMatch', undefined,
                new FormFieldValue(false)
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'mail-filter-new-form-group-comment',
                'Translatable#Comment', KIXObjectProperty.COMMENT, 'text-area-input', false,
                'Translatable#Helptext_Admin_MailFilterCreate_Comment', null, null, null,
                null, null, null, null, null, 250
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'mail-filter-new-form-group-valid',
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
                'mail-filter-new-form-group-information', 'Translatable#Email Filter Information',
                [
                    'mail-filter-new-form-group-name',
                    'mail-filter-new-form-group-stop-after-match',
                    'mail-filter-new-form-group-comment',
                    'mail-filter-new-form-group-valid',
                ]
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'mail-filter-new-form-field-conditions',
                'Translatable#Filter Conditions', MailFilterProperty.MATCH, 'mail-filter-match-form-input', true,
                'Translatable#Helptext_Admin_MailFilterCreate_FilterConditions', undefined, undefined,
                undefined, undefined, undefined, undefined, undefined, undefined, undefined, null,
                undefined, undefined, undefined, undefined, undefined, undefined, false
            )
        );

        configurations.push(
            new FormGroupConfiguration(
                'mail-filter-new-form-group-conditions', 'Translatable#Filter Conditions',
                [
                    'mail-filter-new-form-field-conditions',
                ]
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'mail-filter-new-form-field-headers',
                'Translatable#Set Email Headers', MailFilterProperty.SET, 'mail-filter-set-form-input', true,
                'Translatable#Helptext_Admin_MailFilterCreate_SetEmailHeaders', undefined, undefined,
                undefined, undefined, undefined, undefined, undefined, undefined, undefined, null,
                undefined, undefined, undefined, undefined, undefined, undefined, false
            )
        );

        configurations.push(
            new FormGroupConfiguration(
                'mail-filter-new-form-group-headers', 'Translatable#Set Email Headers',
                [
                    'mail-filter-new-form-field-headers',
                ]
            )
        );

        configurations.push(
            new FormPageConfiguration(
                'mail-filter-new-form-page', 'Translatable#New Email Filter',
                [
                    'mail-filter-new-form-group-information',
                    'mail-filter-new-form-group-conditions',
                    'mail-filter-new-form-group-headers'
                ]
            )
        );

        configurations.push(
            new FormConfiguration(
                formId, 'Translatable#New Email Filter',
                ['mail-filter-new-form-page'],
                KIXObjectType.MAIL_FILTER
            )
        );
        ConfigurationService.getInstance().registerForm([FormContext.NEW], KIXObjectType.MAIL_FILTER, formId);
        return configurations;
    }
}

module.exports = (data, host, options) => {
    return new Extension();
};
