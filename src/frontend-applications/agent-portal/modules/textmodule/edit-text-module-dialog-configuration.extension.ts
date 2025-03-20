/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { EditTextModuleDialogContext } from './webapp/core';
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
        return EditTextModuleDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];

        const widget = new WidgetConfiguration(
            'text-module-edit-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'object-dialog-form-widget', 'Translatable#Edit Text Module',
            [], null, null, false, false, 'kix-icon-edit'
        );
        configurations.push(widget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), 'Textmodule Edit Dialog', ConfigurationType.Context,
                this.getModuleId(), [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'text-module-edit-dialog-widget', 'text-module-edit-dialog-widget',
                        KIXObjectType.TEXT_MODULE, ContextMode.EDIT_ADMIN
                    )
                ], [], [], [], []
            )
        );

        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const formFields = [
            new FormFieldConfiguration(
                'text-modules-edit-form-field-name',
                'Translatable#Name', TextModuleProperty.NAME, null, true,
                'Translatable#Helptext_Admin_TextModuleCreate_Name'
            ),
            new FormFieldConfiguration(
                'text-modules-edit-form-field-keywords',
                'Translatable#Keywords', TextModuleProperty.KEYWORDS, null, false,
                'Translatable#Helptext_Admin_TextModuleCreate_Keywords'
            ),
            new FormFieldConfiguration(
                'text-modules-edit-form-field-text',
                'Translatable#Text', TextModuleProperty.TEXT, 'rich-text-input', true,
                'Translatable#Helptext_Admin_TextModuleCreate_Text'
            ),
            new FormFieldConfiguration(
                'text-modules-edit-form-field-language',
                'Translatable#Language', TextModuleProperty.LANGUAGE, 'language-input', true,
                'Translatable#Helptext_Admin_TextModuleCreate_Language'
            ),
            new FormFieldConfiguration(
                'text-modules-edit-form-field-comment',
                'Translatable#Comment', TextModuleProperty.COMMENT, 'text-area-input', false,
                'Translatable#Helptext_Admin_TextModuleCreate_Comment', null, null, null,
                null, null, null, null, null, 250
            ),
            new FormFieldConfiguration(
                'text-modules-edit-form-field-valid',
                'Translatable#Validity', KIXObjectProperty.VALID_ID,
                'object-reference-input', true, 'Translatable#Helptext_Admin_TextModuleCreate_Validity',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
                ], new FormFieldValue(1)
            )
        ];

        const fieldGroup = new FormGroupConfiguration(
            'text-modules-edit-form-group-module', 'Translatable#Text Module', [], null, formFields
        );

        const dependencyFields = [
            new FormFieldConfiguration(
                'text-modules-edit-form-field-queue-ids',
                'Translatable#Queues', TextModuleProperty.QUEUE_IDS,
                'object-reference-input', false, 'Translatable#Helptext_Admin_TextModuleCreate_QueueIDs',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.QUEUE),
                    new FormFieldOption(ObjectReferenceOptions.MULTISELECT, true),
                    new FormFieldOption(ObjectReferenceOptions.USE_OBJECT_SERVICE, true)
                ]
            ),
            new FormFieldConfiguration(
                'text-modules-edit-form-field-ticket-type-ids',
                'Translatable#Types', TextModuleProperty.TICKET_TYPE_IDS,
                'object-reference-input', false, 'Translatable#Helptext_Admin_TextModuleCreate_TicketTypeIDs',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.TICKET_TYPE),
                    new FormFieldOption(ObjectReferenceOptions.MULTISELECT, true)
                ]
            )
        ];

        const dependencyGroup = new FormGroupConfiguration(
            'text-modules-edit-form-group-dependencies', 'Translatable#Dependencies', [], null, dependencyFields
        );

        const page = new FormPageConfiguration(
            'text-modules-edit-form-page', 'Translatable#Edit Text Module', [],
            true, false, [fieldGroup, dependencyGroup]
        );

        const formId = 'text-module-edit-form';
        const formConfig = new FormConfiguration(
            formId, 'Translatable#Edit Text Module', [], KIXObjectType.TEXT_MODULE, true, FormContext.EDIT
        );
        formConfig.pages.push(page);
        ModuleConfigurationService.getInstance().registerForm([FormContext.EDIT], KIXObjectType.TEXT_MODULE, formId);

        return [formConfig];
    }
}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
