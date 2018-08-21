import {
    ContextConfiguration, FormField, KIXObjectType, Form, ConfigItemProperty,
    VersionProperty, FormFieldOption, AttributeDefinition
} from "@kix/core/dist/model";
import { IModuleFactoryExtension } from "@kix/core/dist/extensions";
import { ServiceContainer } from "@kix/core/dist/common";
import { IConfigurationService, ICmdbService } from "@kix/core/dist/services";
import { FormGroup } from "@kix/core/dist/model/components/form/FormGroup";
import { NewConfigItemDialogContext, NewConfigItemDialogContextConfiguration } from "@kix/core/dist/browser/cmdb";

export class Extension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return NewConfigItemDialogContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {
        return new NewConfigItemDialogContextConfiguration();
    }

    public async createFormDefinitions(): Promise<void> {
        const configurationService =
            ServiceContainer.getInstance().getClass<IConfigurationService>("IConfigurationService");
        const token = configurationService.getServerConfiguration().BACKEND_API_TOKEN;

        const cmdbService =
            ServiceContainer.getInstance().getClass<ICmdbService>("ICmdbService");

        const ciClasses = await cmdbService.loadConfigItemClassWithDefinitions(token);

        for (const ciClass of ciClasses) {
            const formId = `CMDB_CI_${ciClass.Name}_${ciClass.ID}`;
            const existingForm = configurationService.getModuleConfiguration(formId, null);
            if (!existingForm) {
                const fields: FormField[] = [];

                fields.push(new FormField('Name', VersionProperty.NAME, null, true, 'CI Name'));
                fields.push(new FormField(
                    'Verwendungsstatus', ConfigItemProperty.CUR_DEPL_STATE_ID, 'general-catalog-input',
                    true, 'Verwendungsstatus', [new FormFieldOption('GC_CLASS', 'ITSM::ConfigItem::DeploymentState')]
                ));
                fields.push(new FormField(
                    'Vorfallstatus', ConfigItemProperty.CUR_INCI_STATE_ID, 'general-catalog-input',
                    true, 'Vorfallstatus', [new FormFieldOption('GC_CLASS', 'ITSM::Core::IncidentState')]
                ));
                fields.push(new FormField(
                    'Bilder', ConfigItemProperty.IMAGES, 'attachment-input', false, 'Bilder',
                    [new FormFieldOption('MimeTypes', ['image/png', 'image/jpeg', 'image/gif', 'image/bmp'])]
                ));
                fields.push(new FormField(
                    'CI Verknüpfen mit', ConfigItemProperty.LINKS, 'link-input', false, 'CI Verknüpfen mit')
                );

                // class specific fields
                const subGroups: FormGroup[] = [];
                if (ciClass.CurrentDefinition && ciClass.CurrentDefinition.Definition) {
                    ciClass.CurrentDefinition.Definition.forEach((ad) => {
                        if (ad.Input.Type === 'Dummy') {
                            const subFields: FormField[] = [];
                            ad.Sub.forEach((subAd) => subFields.push(this.getFormField(subAd)));
                            subGroups.push(new FormGroup(ad.Name, subFields));
                        } else {
                            fields.push(this.getFormField(ad));
                        }
                    });
                }

                const mainGroup = new FormGroup('Config Item Daten', fields);

                const form = new Form(
                    formId, 'Neues Config Item', [mainGroup, ...subGroups], KIXObjectType.CONFIG_ITEM
                );
                await configurationService.saveModuleConfiguration(form.id, null, form);
            }
            configurationService.registerFormId(formId);
        }
    }

    private getFormField(ad: AttributeDefinition): FormField {
        if (ad.Input.Type === 'GeneralCatalog') {
            return new FormField(ad.Name, ad.Key, 'general-catalog-input', ad.Input.Required, ad.Name,
                [new FormFieldOption('GC_CLASS', ad.Input['Class'])]
            );
        } else if (ad.Input.Type === 'Text') {
            return new FormField(ad.Name, ad.Key, null, ad.Input.Required, ad.Name);
        } else if (ad.Input.Type === 'TextArea') {
            return new FormField(ad.Name, ad.Key, 'text-area-input', ad.Input.Required, ad.Name);
        } else if (ad.Input.Type === 'Contact') {
            return new FormField(ad.Name, ad.Key, 'object-reference-input', ad.Input.Required, ad.Name, [
                new FormFieldOption('OBJECT', KIXObjectType.CONTACT)
            ]);
        } else if (ad.Input.Type === 'Customer') {
            return new FormField(ad.Name, ad.Key, 'object-reference-input', ad.Input.Required, ad.Name, [
                new FormFieldOption('OBJECT', KIXObjectType.CUSTOMER)
            ]);
        } else if (ad.Input.Type === 'CIClassReference') {
            // TODO: CI field
        } else if (ad.Input.Type === 'Date') {
            // TODO: Date field
        } else if (ad.Input.Type === 'DateTime') {
            // TODO: Datetime field
        }

        return new FormField(ad.Name, ad.Key, null, ad.Input.Required, ad.Name);
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
