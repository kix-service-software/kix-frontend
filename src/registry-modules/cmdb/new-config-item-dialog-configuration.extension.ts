import { ContextConfiguration } from "@kix/core/dist/model";
import { IConfigurationExtension } from "@kix/core/dist/extensions";
import { ConfigurationService, CMDBService } from "@kix/core/dist/services";
import {
    NewConfigItemDialogContext, NewConfigItemDialogContextConfiguration, ConfigItemFormFactory
} from "@kix/core/dist/browser/cmdb";

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewConfigItemDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {
        return new NewConfigItemDialogContextConfiguration();
    }

    public async createFormDefinitions(): Promise<void> {
        const configurationService = ConfigurationService.getInstance();
        const token = configurationService.getServerConfiguration().BACKEND_API_TOKEN;

        const cmdbService = CMDBService.getInstance();

        const ciClasses = await cmdbService.loadConfigItemClassWithDefinitions(token);

        for (const ciClass of ciClasses) {
            const formId = `CMDB_CI_${ciClass.Name}_${ciClass.ID}`;
            const existingForm = configurationService.getModuleConfiguration(formId, null);
            if (!existingForm) {
                const form = await ConfigItemFormFactory.getInstance().createCIForm(ciClass, formId);
                await configurationService.saveModuleConfiguration(formId, null, form);
            }
            configurationService.registerFormId(formId);
        }
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
