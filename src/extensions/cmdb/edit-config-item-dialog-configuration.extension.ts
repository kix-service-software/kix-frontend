import { IConfigurationExtension } from '../../core/extensions';
import { ContextConfiguration, KIXObjectType, ConfigItemClass, KIXObjectLoadingOptions } from '../../core/model';
import {
    EditConfigItemDialogContext, ConfigItemFormFactory
} from '../../core/browser/cmdb';
import { ConfigurationService, KIXObjectServiceRegistry } from '../../core/services';

export class EditConfigItemDialogModuleExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditConfigItemDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {
        return new ContextConfiguration(this.getModuleId());
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        const configurationService = ConfigurationService.getInstance();
        const token = configurationService.getServerConfiguration().BACKEND_API_TOKEN;

        const configItemClassService = KIXObjectServiceRegistry.getServiceInstance(
            KIXObjectType.CONFIG_ITEM_CLASS
        );

        const options = new KIXObjectLoadingOptions(null, null, null, [
            'CurrentDefinition'
        ]);

        const ciClasses = await configItemClassService.loadObjects<ConfigItemClass>(
            token, null, KIXObjectType.CONFIG_ITEM_CLASS, null, options, null
        );

        for (const ciClass of ciClasses) {
            const formId = ConfigItemFormFactory.getInstance().getFormId(ciClass, true);
            const existingForm = configurationService.getConfiguration(formId);
            if (formId && !existingForm || overwrite) {
                const form = await ConfigItemFormFactory.getInstance().createCIForm(ciClass, formId, true);
                await configurationService.saveConfiguration(formId, form);
            }
            configurationService.registerFormId(formId);
        }
    }

}

module.exports = (data, host, options) => {
    return new EditConfigItemDialogModuleExtension();
};
