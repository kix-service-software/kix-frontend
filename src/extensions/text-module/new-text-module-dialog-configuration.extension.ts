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
    FormFieldValue, KIXObjectType, FormContext, ContextConfiguration,
    KIXObjectProperty, TextModuleProperty, ObjectReferenceOptions, FormFieldOption,
    ConfiguredDialogWidget, ContextMode, WidgetConfiguration
} from '../../core/model';
import { ConfigurationService } from '../../core/services';
import {
    FormGroupConfiguration, FormConfiguration, FormFieldConfiguration
} from '../../core/model/components/form/configuration';
import { NewTextModuleDialogContext } from '../../core/browser/text-modules';
import { ConfigurationType } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewTextModuleDialogContext.CONTEXT_ID;
    }

    public async createDefaultConfiguration(): Promise<ContextConfiguration> {

        const widget = new WidgetConfiguration(
            'text-module-new-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'new-text-module-dialog', 'Translatable#New Text Module',
            [], null, null, false, false, 'kix-icon-new-gear'
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(widget);

        return new ContextConfiguration(
            'text-module-new-dialog', 'Textmodule New Dialog', ConfigurationType.Context,
            this.getModuleId(), [], [], [], [], [], [], [], [],
            [
                new ConfiguredDialogWidget(
                    'text-module-new-dialog-widget', 'text-module-new-dialog-widget',
                    KIXObjectType.TEXT_MODULE, ContextMode.CREATE_ADMIN
                )
            ]
        );
    }

    public async createFormConfigurations(overwrite: boolean): Promise<void> {

        const formId = 'text-module-new-form';

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'text-modules-new-form-field-name',
                'Translatable#Name', TextModuleProperty.NAME, null, true,
                'Translatable#Helptext_Admin_TextModuleCreate_Name'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'text-modules-new-form-field-keywords',
                'Translatable#Keywords', TextModuleProperty.KEYWORDS, null, false,
                'Translatable#Helptext_Admin_TextModuleCreate_Keywords'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'text-modules-new-form-field-text',
                'Translatable#Text', TextModuleProperty.TEXT, 'rich-text-input', true,
                'Translatable#Helptext_Admin_TextModuleCreate_Text'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'text-modules-new-form-field-language',
                'Translatable#Language', TextModuleProperty.LANGUAGE, 'language-input', false,
                'Translatable#Helptext_Admin_TextModuleCreate_Language'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'text-modules-new-form-field-comment',
                'Translatable#Comment', TextModuleProperty.COMMENT, 'text-area-input', false,
                'Translatable#Helptext_Admin_TextModuleCreate_Comment', null, null, null,
                null, null, null, null, 250
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'text-modules-new-form-field-valid',
                'Translatable#Validity', KIXObjectProperty.VALID_ID,
                'object-reference-input', true, 'Translatable#Helptext_Admin_TextModuleCreate_Validity', [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
            ], new FormFieldValue(1)
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormGroupConfiguration(
                'text-modules-new-form-group-module', 'Translatable#Text Module',
                [
                    'text-modules-new-form-field-name',
                    'text-modules-new-form-field-keywords',
                    'text-modules-new-form-field-text',
                    'text-modules-new-form-field-language',
                    'text-modules-new-form-field-comment',
                    'text-modules-new-form-field-valid'
                ]
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormConfiguration(
                formId, 'Translatable#New Text Module',
                [
                    'text-modules-new-form-group-module'
                ],
                KIXObjectType.TEXT_MODULE
            )
        );
        ConfigurationService.getInstance().registerForm([FormContext.NEW], KIXObjectType.TEXT_MODULE, formId);
    }
}

module.exports = (data, host, options) => {
    return new Extension();
};
