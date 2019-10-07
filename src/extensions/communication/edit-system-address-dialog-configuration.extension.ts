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
    ConfiguredWidget, FormField, FormFieldValue, SystemAddressProperty, Form,
    KIXObjectType, FormContext, ContextConfiguration, KIXObjectProperty, FormFieldOption, ObjectReferenceOptions
} from '../../core/model';
import { ConfigurationService } from '../../core/services';
import { FormGroup } from '../../core/model/components/form/FormGroup';
import { FormValidationService } from '../../core/browser/form/validation';
import { EditSystemAddressDialogContext } from '../../core/browser/system-address';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditSystemAddressDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const sidebars = [];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [];

        return new ContextConfiguration(this.getModuleId(), sidebars, sidebarWidgets);
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const formId = 'edit-system-address-form';
        const existing = configurationService.getConfiguration(formId);
        if (!existing) {
            const fields: FormField[] = [
                new FormField(
                    'Translatable#Email Address', SystemAddressProperty.NAME, null, true,
                    'Translatable#Helptext_Admin_SystemAddressCreate_Name', null, null, null, null, null,
                    null, null, null, FormValidationService.EMAIL_REGEX, FormValidationService.EMAIL_REGEX_ERROR_MESSAGE
                ),
                new FormField(
                    'Translatable#Display Name', SystemAddressProperty.REALNAME, null, true,
                    'Translatable#Helptext_Admin_SystemAddressCreate_DisplayName'
                ),
                new FormField(
                    'Translatable#Comment', SystemAddressProperty.COMMENT, 'text-area-input', false,
                    'Translatable#Helptext_Admin_SystemAddressCreate_Comment', null, null, null,
                    null, null, null, null, 250
                ),
                new FormField(
                    'Translatable#Validity', KIXObjectProperty.VALID_ID,
                    'object-reference-input', true, 'Translatable#Helptext_Admin_SystemAddressCreate_Validity', [
                        new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
                    ], new FormFieldValue(1)
                )
            ];

            const group = new FormGroup('Translatable#System Addresses', fields);

            const form = new Form(
                formId, 'Translatable#Edit Address', [group], KIXObjectType.SYSTEM_ADDRESS, true, FormContext.EDIT
            );
            await configurationService.saveConfiguration(form.id, form);
        }
        configurationService.registerForm([FormContext.EDIT], KIXObjectType.SYSTEM_ADDRESS, formId);
    }
}

module.exports = (data, host, options) => {
    return new Extension();
};
