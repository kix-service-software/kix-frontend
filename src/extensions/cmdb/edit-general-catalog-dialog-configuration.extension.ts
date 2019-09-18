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
    KIXObjectProperty,
    GeneralCatalogItemProperty
} from '../../core/model';
import { ConfigurationService } from '../../core/services';
import { FormGroup } from '../../core/model/components/form/FormGroup';
import { EditGeneralCatalogDialogContext } from '../../core/browser/general-catalog';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditGeneralCatalogDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const sidebars = [];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [];

        return new ContextConfiguration(this.getModuleId(), sidebars, sidebarWidgets);
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const formId = 'edit-general-catalog-form';
        const existing = configurationService.getConfiguration(formId);

        if (!existing) {
            const group = new FormGroup('Translatable#General Catalog', [
                new FormField(
                    'Translatable#Class', GeneralCatalogItemProperty.CLASS, 'general-catalog-class-input', true,
                    'Translatable#Helptext_Admin_GeneralCatalogCreate_Class', null, null, null,
                    null, null, null, null, 100, null, null, null, null, true
                ),
                new FormField(
                    'Translatable#Name', GeneralCatalogItemProperty.NAME, null, true,
                    'Translatable#Helptext_Admin_GeneralCatalogCreate_Name', null, null, null,
                    null, null, null, null, 100
                ),
                new FormField(
                    'Translatable#Icon', 'ICON', 'icon-input', false,
                    'Translatable#Helptext_Admin_Tickets_GeneralCatalogCreate_Icon.'
                ),
                new FormField(
                    'Translatable#Comment', KIXObjectProperty.COMMENT, 'text-area-input', false,
                    'Translatable#Helptext_Admin_GeneralCatalogCreate_Comment', null, null, null,
                    null, null, null, null, 250
                ),
                new FormField(
                    'Translatable#Validity', KIXObjectProperty.VALID_ID, 'valid-input', true,
                    'Translatable#Helptext_Admin_GeneralCatalogCreate_Validity',
                    null, new FormFieldValue(1)
                )
            ]);

            const form = new Form(
                formId, 'Translatable#Edit Value', [group],
                KIXObjectType.GENERAL_CATALOG_ITEM, false, FormContext.EDIT
            );
            await configurationService.saveConfiguration(form.id, form);
        }
        configurationService.registerForm([FormContext.EDIT], KIXObjectType.GENERAL_CATALOG_ITEM, formId);
    }
}

module.exports = (data, host, options) => {
    return new Extension();
};
