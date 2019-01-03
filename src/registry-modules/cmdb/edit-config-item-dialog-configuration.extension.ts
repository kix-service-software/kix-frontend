import { IConfigurationExtension } from '../../core/extensions';
import { ContextConfiguration, KIXObjectType, ConfigItemClass } from '../../core/model';
import {
    EditConfigItemDialogContext,
    EditConfigItemDialogContextConfiguration,
    ConfigItemFormFactory
} from '../../core/browser/cmdb';
import { ConfigurationService, KIXObjectServiceRegistry } from '../../core/services';

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

        const configItemClassService = KIXObjectServiceRegistry.getInstance().getServiceInstance(
            KIXObjectType.CONFIG_ITEM_CLASS
        );

        const ciClasses = await configItemClassService.loadObjects<ConfigItemClass>(
            token, KIXObjectType.CONFIG_ITEM_CLASS, null, null, null
        );

        for (const ciClass of ciClasses) {
            const formId = `CMDB_CI_${ciClass.Name}_${ciClass.ID}_EDIT`;
            const existingForm = configurationService.getModuleConfiguration(formId, null);
            if (!existingForm) {
                const form = await ConfigItemFormFactory.getInstance().createCIForm(ciClass, formId, true);
                await configurationService.saveModuleConfiguration(formId, null, form);
            }
            configurationService.registerFormId(formId);
        }
    }

}

module.exports = (data, host, options) => {
    return new EditConfigItemDialogModuleExtension();
};
