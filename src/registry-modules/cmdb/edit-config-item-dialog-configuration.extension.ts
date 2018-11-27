import { IConfigurationExtension } from '@kix/core/dist/extensions';
import { ContextConfiguration } from '@kix/core/dist/model';
import {
    EditConfigItemDialogContext,
    EditConfigItemDialogContextConfiguration,
    ConfigItemFormFactory
} from '@kix/core/dist/browser/cmdb';
import { ConfigurationService, CMDBService } from '@kix/core/dist/services';

export class EditConfigItemDialogModuleExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditConfigItemDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {
        return new EditConfigItemDialogContextConfiguration(this.getModuleId());
    }

    public async createFormDefinitions(): Promise<void> {
        const configurationService = ConfigurationService.getInstance();
        const token = configurationService.getServerConfiguration().BACKEND_API_TOKEN;

        const cmdbService = CMDBService.getInstance();

        const ciClasses = await cmdbService.loadConfigItemClassWithDefinitions(token);

        for (const ciClass of ciClasses) {
            const formId = `CMDB_CI_${ciClass.Name}_${ciClass.ID}_EDIT`;
            const existingForm = configurationService.getModuleConfiguration(formId, null);
            if (!existingForm) {
                const form = ConfigItemFormFactory.getInstance().createCIForm(ciClass, formId, true);
                await configurationService.saveModuleConfiguration(formId, null, form);
            }
            configurationService.registerFormId(formId);
        }
    }

}

module.exports = (data, host, options) => {
    return new EditConfigItemDialogModuleExtension();
};
