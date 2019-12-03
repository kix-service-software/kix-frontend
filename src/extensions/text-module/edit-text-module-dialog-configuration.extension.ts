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
    WidgetConfiguration, ConfiguredDialogWidget, ContextMode
} from '../../core/model';
import { ConfigurationService } from '../../core/services';
import {
    FormGroupConfiguration, FormFieldConfiguration, FormConfiguration, FormPageConfiguration
} from '../../core/model/components/form/configuration';
import { EditTextModuleDialogContext } from '../../core/browser/text-modules';
import { ConfigurationType, IConfiguration } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditTextModuleDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];

        const widget = new WidgetConfiguration(
            'text-module-edit-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'edit-text-module-dialog', 'Translatable#Edit Text Module',
            [], null, null, false, false, 'kix-icon-edit'
        );
        configurations.push(widget);


        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), 'Textmodule Edit Dialog', ConfigurationType.Context,
                this.getModuleId(), [], [], [], [], [], [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'text-module-edit-dialog-widget', 'text-module-edit-dialog-widget',
                        KIXObjectType.TEXT_MODULE, ContextMode.EDIT_ADMIN
                    )
                ]
            )
        );

        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const configurations = [];
        const formId = 'text-module-edit-form';

        configurations.push(
            new FormFieldConfiguration(
                'text-modules-edit-form-field-name',
                'Translatable#Name', TextModuleProperty.NAME, null, true,
                'Translatable#Helptext_Admin_TextModuleCreate_Name'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'text-modules-edit-form-field-keywords',
                'Translatable#Keywords', TextModuleProperty.KEYWORDS, null, false,
                'Translatable#Helptext_Admin_TextModuleCreate_Keywords'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'text-modules-edit-form-field-text',
                'Translatable#Text', TextModuleProperty.TEXT, 'rich-text-input', true,
                'Translatable#Helptext_Admin_TextModuleCreate_Text'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'text-modules-edit-form-field-language',
                'Translatable#Language', TextModuleProperty.LANGUAGE, 'language-input', false,
                'Translatable#Helptext_Admin_TextModuleCreate_Language'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'text-modules-edit-form-field-comment',
                'Translatable#Comment', TextModuleProperty.COMMENT, 'text-area-input', false,
                'Translatable#Helptext_Admin_TextModuleCreate_Comment', null, null, null,
                null, null, null, null, null, 250
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'text-modules-edit-form-field-valid',
                'Translatable#Validity', KIXObjectProperty.VALID_ID,
                'object-reference-input', true, 'Translatable#Helptext_Admin_TextModuleCreate_Validity', [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
            ], new FormFieldValue(1)
            )
        );

        configurations.push(
            new FormGroupConfiguration(
                'text-modules-edit-form-group-module', 'Translatable#Text Module',
                [
                    'text-modules-edit-form-field-name',
                    'text-modules-edit-form-field-keywords',
                    'text-modules-edit-form-field-text',
                    'text-modules-edit-form-field-language',
                    'text-modules-edit-form-field-comment',
                    'text-modules-edit-form-field-valid'
                ]
            )
        );

        configurations.push(
            new FormPageConfiguration(
                'text-modules-edit-form-page', 'Translatable#Edit Text Module',
                ['text-modules-edit-form-group-module']
            )
        );

        configurations.push(
            new FormConfiguration(
                formId, 'Translatable#Edit Text Module',
                ['text-modules-edit-form-page'],
                KIXObjectType.TEXT_MODULE, true, FormContext.EDIT
            )
        );
        ConfigurationService.getInstance().registerForm([FormContext.EDIT], KIXObjectType.TEXT_MODULE, formId);

        return configurations;
    }
}

module.exports = (data, host, options) => {
    return new Extension();
};
