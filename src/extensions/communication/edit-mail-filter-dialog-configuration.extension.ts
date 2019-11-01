/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../core/extensions';
import { EditMailFilterDialogContext } from '../../core/browser/mail-filter';
import {
    ConfiguredWidget, FormFieldValue, MailFilterProperty,
    KIXObjectType, FormContext, ContextConfiguration, FormFieldOption,
    KIXObjectProperty, WidgetConfiguration, ObjectReferenceOptions, ConfiguredDialogWidget,
    ContextMode, HelpWidgetConfiguration
} from '../../core/model';
import { ConfigurationService } from '../../core/services';
import {
    FormGroupConfiguration, FormFieldConfiguration, FormConfiguration
} from '../../core/model/components/form/configuration';
import { ConfigurationType, ConfigurationDefinition } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditMailFilterDialogContext.CONTEXT_ID;
    }

    public async createDefaultConfiguration(): Promise<ContextConfiguration> {

        const helpConfig = new HelpWidgetConfiguration(
            'mail-filter-edit-dialog-help-widget-config', 'Help Config', ConfigurationType.HelpWidget,
            'Translatable#Helptext_Admin_MailFilter_Sidebar', []
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(helpConfig);

        const filterHelpSidebar = new WidgetConfiguration(
            'mail-filter-edit-dialog-help-widget', 'Widget', ConfigurationType.Widget,
            'help-widget', null, [],
            new ConfigurationDefinition('mail-filter-edit-dialog-help-widget-config', ConfigurationType.HelpWidget),
            null, false, false, 'kix-icon-query'
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(filterHelpSidebar);

        const dialogWidget = new WidgetConfiguration(
            'mail-filter-edit-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'edit-mail-filter-dialog', 'Translatable#Edit Email Filter',
            [], null, null, false, false, 'kix-icon-edit'
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(dialogWidget);

        return new ContextConfiguration(
            this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
            this.getModuleId(),
            [
                new ConfiguredWidget('mail-filter-edit-dialog-help-widget', 'mail-filter-edit-dialog-help-widget')
            ],
            [], [], [], [], [], [], [],
            [
                new ConfiguredDialogWidget(
                    'mail-filter-edit-dialog-widget', 'mail-filter-edit-dialog-widget',
                    KIXObjectType.MAIL_FILTER, ContextMode.EDIT_ADMIN
                )
            ]
        );
    }

    public async createFormConfigurations(overwrite: boolean): Promise<void> {
        const formId = 'mail-filter-new-form';

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'mail-filter-new-form-group-name',
                'Translatable#Name', MailFilterProperty.NAME, null, true,
                'Translatable#Helptext_Admin_MailFilterCreate_Name'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'mail-filter-new-form-group-stop-after-match',
                'Translatable#Stop after match', MailFilterProperty.STOP_AFTER_MATCH, 'checkbox-input', true,
                'Translatable#Helptext_Admin_MailFilterCreate_StopAfterMatch', undefined,
                new FormFieldValue(false)
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'mail-filter-new-form-group-comment',
                'Translatable#Comment', KIXObjectProperty.COMMENT, 'text-area-input', false,
                'Translatable#Helptext_Admin_MailFilterCreate_Comment', null, null, null,
                null, null, null, null, 250
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
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

        await ModuleConfigurationService.getInstance().saveConfiguration(
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

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'mail-filter-new-form-group-conditions',
                'Translatable#Filter Conditions', MailFilterProperty.MATCH, 'mail-filter-match-form-input', true,
                'Translatable#Helptext_Admin_MailFilterCreate_FilterConditions', undefined, undefined,
                undefined, undefined, undefined, undefined, undefined, undefined, undefined, null,
                undefined, undefined, undefined, undefined, undefined, undefined, false
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormGroupConfiguration(
                'mail-filter-new-form-group-conditions', 'Translatable#Filter Conditions',
                [
                    'mail-filter-new-form-group-conditions',
                ]
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'mail-filter-new-form-group-headers',
                'Translatable#Set Email Headers', MailFilterProperty.SET, 'mail-filter-set-form-input', true,
                'Translatable#Helptext_Admin_MailFilterCreate_SetEmailHeaders', undefined, undefined,
                undefined, undefined, undefined, undefined, undefined, undefined, undefined, null,
                undefined, undefined, undefined, undefined, undefined, undefined, false
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormGroupConfiguration(
                'mail-filter-new-form-group-headers', 'Translatable#Set Email Headers',
                [
                    'mail-filter-new-form-group-headers',
                ]
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormConfiguration(
                formId, 'Translatable#New Email Filter',
                [
                    'mail-filter-new-form-group-information',
                    'mail-filter-new-form-group-conditions',
                    'mail-filter-new-form-group-headers'
                ],
                KIXObjectType.MAIL_FILTER, true, FormContext.EDIT
            )
        );
        ConfigurationService.getInstance().registerForm([FormContext.EDIT], KIXObjectType.MAIL_FILTER, formId);
    }
}

module.exports = (data, host, options) => {
    return new Extension();
};
