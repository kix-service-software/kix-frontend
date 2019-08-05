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
    ConfiguredWidget, FormField, FormFieldValue, Form, KIXObjectType, FormContext, ContextConfiguration,
    KIXObjectProperty, TextModuleProperty
} from '../../core/model';
import { ConfigurationService } from '../../core/services';
import { FormGroup } from '../../core/model/components/form/FormGroup';
import { EditTextModuleDialogContext } from '../../core/browser/text-modules';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditTextModuleDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const sidebars = [];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [];

        return new ContextConfiguration(this.getModuleId(), sidebars, sidebarWidgets);
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const formId = 'edit-text-module-form';
        const existing = configurationService.getConfiguration(formId);
        if (!existing) {
            const group = new FormGroup('Translatable#Text Module', [
                new FormField(
                    'Translatable#Name', TextModuleProperty.NAME, null, true,
                    'Translatable#Helptext_Admin_TextModuleEdit_Name'
                ),
                new FormField(
                    'Translatable#Keywords', TextModuleProperty.KEYWORDS, null, false,
                    'Translatable#Helptext_Admin_TextModuleEdit_Keywords'
                ),
                new FormField(
                    'Translatable#Text', TextModuleProperty.TEXT, 'rich-text-input', true,
                    'Translatable#Helptext_Admin_TextModuleEdit_Text'
                ),
                new FormField(
                    'Translatable#Language', TextModuleProperty.LANGUAGE, 'language-input', false,
                    'Translatable#Helptext_Admin_TextModuleEdit_Language'
                ),
                new FormField(
                    'Translatable#Comment', TextModuleProperty.COMMENT, 'text-area-input', false,
                    'Translatable#Helptext_Admin_TextModuleEdit_Comment', null, null, null,
                    null, null, null, null, 250
                ),
                new FormField(
                    'Translatable#Validity', KIXObjectProperty.VALID_ID, 'valid-input', true,
                    'Translatable#Helptext_Admin_TextModuleEdit_Validity',
                    null, new FormFieldValue(1)
                )
            ]);

            const form = new Form(
                formId, 'Translatable#Edit Text Module', [group], KIXObjectType.TEXT_MODULE, true, FormContext.EDIT
            );
            await configurationService.saveConfiguration(form.id, form);
        }
        configurationService.registerForm([FormContext.EDIT], KIXObjectType.TEXT_MODULE, formId);
    }
}

module.exports = (data, host, options) => {
    return new Extension();
};
