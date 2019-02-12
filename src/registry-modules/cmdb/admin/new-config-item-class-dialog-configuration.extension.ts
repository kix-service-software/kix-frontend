
import {
    ContextConfiguration, FormField, ConfigItemClassProperty, FormFieldValue, Form,
    KIXObjectType, FormContext, ConfiguredWidget
} from "../../../core/model";
import { IConfigurationExtension } from "../../../core/extensions";
import { ConfigurationService } from "../../../core/services";
import {
    NewConfigItemClassDialogContext, NewConfigItemClassDialogContextConfiguration
} from "../../../core/browser/cmdb";
import { FormGroup } from "../../../core/model/components/form/FormGroup";

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewConfigItemClassDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {
        const sidebars = [];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [];

        return new NewConfigItemClassDialogContextConfiguration(this.getModuleId(), sidebars, sidebarWidgets);
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const formId = 'new-config-item-class-form';
        const existing = configurationService.getModuleConfiguration(formId, null);
        if (!existing || overwrite) {
            const fields: FormField[] = [];
            fields.push(new FormField(
                "Name", ConfigItemClassProperty.NAME, null, true, "Geben Sie einen Namen für die CMDB Klasse ein."
            ));
            fields.push(new FormField(
                "Icon", ConfigItemClassProperty.ICON, 'icon-input', false,
                "Wählen Sie ein Icon für die CMDB Klasse."
            ));
            fields.push(new FormField(
                "Klassendefinition", ConfigItemClassProperty.DEFINITION_STRING, 'text-area-input', true,
                "Geben Sie die Definition für die CMDB Klasse ein.", null, null, null, null, null, null, null
            ));
            fields.push(new FormField(
                "Kommentar", ConfigItemClassProperty.COMMENT, 'text-area-input', false,
                "Geben Sie einen Kommentar für die CMDB Klasse ein.", null, null, null, null, null, null, null, 200
            ));
            fields.push(new FormField(
                "Gültigkeit", ConfigItemClassProperty.VALID_ID, 'valid-input', true,
                "Legen Sie fest, ob die CMDB Klasse „gültig“, „ungültig“ oder „temporär ungültig“ ist.",
                null, new FormFieldValue(1)
            ));

            const group = new FormGroup('CMDB-Klassen-Definition Daten', fields);

            const form = new Form(formId, 'CMDB Klasse hinzufügen', [group], KIXObjectType.CONFIG_ITEM_CLASS);
            await configurationService.saveModuleConfiguration(form.id, null, form);
        }
        configurationService.registerForm([FormContext.NEW], KIXObjectType.CONFIG_ITEM_CLASS, formId);
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
