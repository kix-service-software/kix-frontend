import {
    ContextConfiguration, FormField, KIXObjectType, Form, ConfigItemProperty, VersionProperty, FormFieldOption
} from "@kix/core/dist/model";
import { IModuleFactoryExtension } from "@kix/core/dist/extensions";
import { ServiceContainer } from "@kix/core/dist/common";
import { IConfigurationService, ICmdbService } from "@kix/core/dist/services";
import { FormGroup } from "@kix/core/dist/model/components/form/FormGroup";
import { NewFAQArticleDialogContext, NewFAQArticleDialogContextConfiguration } from "@kix/core/dist/browser/faq";

export class Extension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return NewFAQArticleDialogContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {
        return new NewFAQArticleDialogContextConfiguration();
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

                fields.push(new FormField('Name', VersionProperty.NAME, true, 'CI Name'));
                fields.push(new FormField(
                    'Verwendungsstatus', ConfigItemProperty.CUR_DEPL_STATE_ID, true, 'Verwendungsstatus')
                );
                fields.push(new FormField(
                    'Vorfallstatus', ConfigItemProperty.CUR_INCI_STATE_ID, true, 'Vorfallstatus')
                );
                fields.push(new FormField(
                    'Bilder', ConfigItemProperty.IMAGES, false, 'Bilder',
                    [new FormFieldOption('MimeTypes', ['image/png', 'image/jpeg', 'image/gif', 'image/bmp'])]
                ));
                fields.push(new FormField(
                    'CI Verknüpfen mit', ConfigItemProperty.LINKS, false, 'CI Verknüpfen mit')
                );

                const group = new FormGroup('Config Item Daten', fields);
                const form = new Form(formId, 'Neues Config Item', [group], KIXObjectType.CONFIG_ITEM);
                await configurationService.saveModuleConfiguration(form.id, null, form);
            }
            configurationService.registerFormId(formId);
        }
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
