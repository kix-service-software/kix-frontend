/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { NewTextModuleDialogContext } from './webapp/core';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredDialogWidget } from '../../model/configuration/ConfiguredDialogWidget';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { ContextMode } from '../../model/ContextMode';
import { FormFieldConfiguration } from '../../model/configuration/FormFieldConfiguration';
import { KIXObjectProperty } from '../../model/kix/KIXObjectProperty';
import { FormFieldOption } from '../../model/configuration/FormFieldOption';
import { ObjectReferenceOptions } from '../../modules/base-components/webapp/core/ObjectReferenceOptions';
import { FormFieldValue } from '../../model/configuration/FormFieldValue';
import { FormGroupConfiguration } from '../../model/configuration/FormGroupConfiguration';
import { FormPageConfiguration } from '../../model/configuration/FormPageConfiguration';
import { FormConfiguration } from '../../model/configuration/FormConfiguration';

import { FormContext } from '../../model/configuration/FormContext';
import { ModuleConfigurationService } from '../../server/services/configuration/ModuleConfigurationService';
import { TextModuleProperty } from './model/TextModuleProperty';

import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewTextModuleDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];

        const widget = new WidgetConfiguration(
            'text-module-new-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'object-dialog-form-widget', 'Translatable#New Text Module',
            [], null, null, false, false, 'kix-icon-new-gear'
        );
        configurations.push(widget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), 'Textmodule New Dialog', ConfigurationType.Context,
                this.getModuleId(), [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'text-module-new-dialog-widget', 'text-module-new-dialog-widget',
                        KIXObjectType.TEXT_MODULE, ContextMode.CREATE_ADMIN
                    )
                ], [], [], [], []
            )
        );

        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const configurations = [];
        const formId = 'text-module-new-form';

        configurations.push(
            new FormFieldConfiguration(
                'text-modules-new-form-field-name',
                'Translatable#Name', TextModuleProperty.NAME, null, true,
                'Translatable#Helptext_Admin_TextModuleCreate_Name'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'text-modules-new-form-field-keywords',
                'Translatable#Keywords', TextModuleProperty.KEYWORDS, null, false,
                'Translatable#Helptext_Admin_TextModuleCreate_Keywords'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'text-modules-new-form-field-text',
                'Translatable#Text', TextModuleProperty.TEXT, 'rich-text-input', true,
                'Translatable#Helptext_Admin_TextModuleCreate_Text'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'text-modules-new-form-field-language',
                'Translatable#Language', TextModuleProperty.LANGUAGE, 'language-input', true,
                'Translatable#Helptext_Admin_TextModuleCreate_Language'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'text-modules-new-form-field-comment',
                'Translatable#Comment', TextModuleProperty.COMMENT, 'text-area-input', false,
                'Translatable#Helptext_Admin_TextModuleCreate_Comment', null, null, null,
                null, null, null, null, null, 250
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'text-modules-new-form-field-valid',
                'Translatable#Validity', KIXObjectProperty.VALID_ID,
                'object-reference-input', true, 'Translatable#Helptext_Admin_TextModuleCreate_Validity', [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
            ], new FormFieldValue(1)
            )
        );

        configurations.push(
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

        configurations.push(
            new FormPageConfiguration(
                'text-modules-new-form-page', 'Translatable#New Text Module',
                ['text-modules-new-form-group-module']
            )
        );

        configurations.push(
            new FormConfiguration(
                formId, 'Translatable#New Text Module',
                ['text-modules-new-form-page'],
                KIXObjectType.TEXT_MODULE
            )
        );
        ModuleConfigurationService.getInstance().registerForm([FormContext.NEW], KIXObjectType.TEXT_MODULE, formId);

        return configurations;
    }
}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
