import { IConfigurationExtension } from "../../core/extensions";
import { ConfigurationService } from "../../core/services";
import { FormGroup } from "../../core/model/components/form/FormGroup";
import { EditOrganisationDialogContext } from "../../core/browser/organisation";
import {
    ContextConfiguration, FormField, OrganisationProperty, KIXObjectProperty, KIXObjectType, Form, FormContext
} from "../../core/model";

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditOrganisationDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {
        return new ContextConfiguration(EditOrganisationDialogContext.CONTEXT_ID);
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const formId = 'edit-organisation-form';
        const existingForm = configurationService.getModuleConfiguration(formId, null);
        if (!existingForm || overwrite) {
            const groups: FormGroup[] = [];

            groups.push(new FormGroup('Translatable#Organisation Information', [
                new FormField(
                    'Translatable#Name', OrganisationProperty.NAME, null, true,
                    'Translatable#Helptext_Organisations_OrganisationCreate_Name'
                ),
                new FormField(
                    'Translatable#URL', OrganisationProperty.URL, null, false,
                    'Translatable#Helptext_Organisations_OrganisationCreate_URL'
                )
            ]));

            groups.push(new FormGroup('Translatable#Postal Address', [
                new FormField(
                    'Translatable#Street', OrganisationProperty.STREET, null, false,
                    'Translatable#Helptext_Organisations_OrganisationCreate_Street'
                ),
                new FormField(
                    'Translatable#Zip', OrganisationProperty.ZIP, null, false,
                    'Translatable#Helptext_Organisations_OrganisationCreate_Zip'
                ),
                new FormField(
                    'Translatable#City', OrganisationProperty.CITY, null, false,
                    'Translatable#Helptext_Organisations_OrganisationCreate_City'
                ),
                new FormField(
                    'Translatable#Country', OrganisationProperty.COUNTRY, null, false,
                    'Translatable#Helptext_Organisations_OrganisationCreate_Country'
                )
            ]));

            groups.push(new FormGroup('Translatable#Other', [
                new FormField(
                    'Translatable#Comment', OrganisationProperty.COMMENT, 'text-area-input', false,
                    'Translatable#Helptext_Organisations_OrganisationCreate_Comment', null, null, null, null,
                    null, null, null, 250
                ),
                new FormField(
                    'Translatable#Validity', KIXObjectProperty.VALID_ID, 'valid-input', false,
                    'Translatable#Helptext_Organisations_OrganisationCreate_Validity'
                )
            ]));

            const form = new Form(
                formId, 'Edit Organisation', groups, KIXObjectType.ORGANISATION, undefined, FormContext.EDIT
            );
            await configurationService.saveModuleConfiguration(form.id, null, form);
        }
        configurationService.registerForm([FormContext.EDIT], KIXObjectType.ORGANISATION, formId);
    }
}

module.exports = (data, host, options) => {
    return new Extension();
};