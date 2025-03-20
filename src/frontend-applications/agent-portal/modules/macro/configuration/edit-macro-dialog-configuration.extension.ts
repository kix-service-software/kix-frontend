/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../../server/extensions/IConfigurationExtension';
import { IConfiguration } from '../../../model/configuration/IConfiguration';
import { WidgetConfiguration } from '../../../model/configuration/WidgetConfiguration';
import { ConfigurationType } from '../../../model/configuration/ConfigurationType';
import { ContextConfiguration } from '../../../model/configuration/ContextConfiguration';
import { ConfiguredDialogWidget } from '../../../model/configuration/ConfiguredDialogWidget';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { ContextMode } from '../../../model/ContextMode';
import { FormGroupConfiguration } from '../../../model/configuration/FormGroupConfiguration';
import { FormFieldConfiguration } from '../../../model/configuration/FormFieldConfiguration';
import { FormPageConfiguration } from '../../../model/configuration/FormPageConfiguration';
import { FormConfiguration } from '../../../model/configuration/FormConfiguration';
import { FormContext } from '../../../model/configuration/FormContext';
import { ModuleConfigurationService } from '../../../server/services/configuration/ModuleConfigurationService';
import { KIXExtension } from '../../../../../server/model/KIXExtension';
import { FormFieldOption } from '../../../model/configuration/FormFieldOption';
import { ObjectReferenceOptions } from '../../base-components/webapp/core/ObjectReferenceOptions';
import { KIXObjectProperty } from '../../../model/kix/KIXObjectProperty';
import { FormFieldValue } from '../../../model/configuration/FormFieldValue';
import { MacroProperty } from '../model/MacroProperty';
import { EditMacroDialogContext } from '../webapp/core/EditMacroDialogContext';

class Extension extends KIXExtension implements IConfigurationExtension {

    public pluginId: string = 'KIXPro';

    public getModuleId(): string {
        return EditMacroDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const widget = new WidgetConfiguration(
            'ruleset-macro-edit-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'object-dialog-form-widget', 'Translatable#Edit Ruleset Macro', [], null, null,
            false, false, 'kix-icon-edit'
        );
        configurations.push(widget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), 'Edit Ruleset Macro Dialog', ConfigurationType.Context,
                this.getModuleId(), [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'ruleset-macro-edit-dialog-widget', 'ruleset-macro-edit-dialog-widget',
                        KIXObjectType.MACRO, ContextMode.EDIT_ADMIN
                    )
                ], [], [], [], []
            )
        );

        return configurations;
    }

    /* eslint-disable max-len */
    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const formId = 'ruleset-macro-edit-form';
        const configurations = [];

        configurations.push(
            new FormConfiguration(
                formId, 'Translatable#Edit Ruleset Macro',
                [],
                KIXObjectType.MACRO, true, FormContext.EDIT, null,
                [
                    new FormPageConfiguration(
                        'ruleset-macro-edit-form-page', 'Translatable#Macro Information',
                        [], true, false,
                        [
                            new FormGroupConfiguration(
                                'ruleset-macro-edit-form-group-data', 'Translatable#Macro Information',
                                [], null,
                                [
                                    new FormFieldConfiguration(
                                        'ruleset-macro-edit-form-field-name',
                                        'Translatable#Name', MacroProperty.NAME, null, true,
                                        'Translatable#Helptext_Admin_Ruleset_Macro_Edit_Name'
                                    ),
                                    new FormFieldConfiguration(
                                        'ruleset-macro-edit-form-field-type',
                                        'Translatable#Type', MacroProperty.TYPE,
                                        'object-reference-input', true, 'Translatable#Helptext_Admin_Ruleset_Macro_Edit_Type',
                                        [
                                            new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.MACRO_TYPE)
                                        ]
                                    ),
                                    new FormFieldConfiguration(
                                        'ruleset-macro-edit-form-field-scope',
                                        'Translatable#Scope', MacroProperty.SCOPE, null, true,
                                        'Translatable#Helptext_Admin_Ruleset_Macro_Edit_Scope', null,
                                        new FormFieldValue('Ruleset'), [], [], null, null, null, null,
                                        null, null, null, null, null, true
                                    ),
                                    new FormFieldConfiguration(
                                        'ruleset-macro-edit-form-field-comment',
                                        'Translatable#Comment', KIXObjectProperty.COMMENT, 'text-area-input', false,
                                        'Translatable#Helptext_Admin_Ruleset_Macro_Edit_Comment'
                                    ),
                                    new FormFieldConfiguration(
                                        'ruleset-macro-edit-form-field-valid',
                                        'Translatable#Validity', KIXObjectProperty.VALID_ID,
                                        'object-reference-input', true, 'Translatable#Helptext_Admin_Ruleset_Macro_Edit_Validity',
                                        [
                                            new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
                                        ],
                                        new FormFieldValue(1)
                                    )
                                ]
                            )
                        ]
                    )
                ]
            )
        );
        ModuleConfigurationService.getInstance().registerForm([FormContext.EDIT], KIXObjectType.MACRO, formId);

        return configurations;
    }
}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
