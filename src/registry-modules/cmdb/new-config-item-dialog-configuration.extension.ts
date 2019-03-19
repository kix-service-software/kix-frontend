import { ContextConfiguration, ConfigItemClass, KIXObjectType, KIXObjectLoadingOptions } from "../../core/model";
import { IConfigurationExtension } from "../../core/extensions";
import { ConfigurationService, KIXObjectServiceRegistry } from "../../core/services";
import {
    NewConfigItemDialogContext, NewConfigItemDialogContextConfiguration, ConfigItemFormFactory
} from "../../core/browser/cmdb";

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewConfigItemDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {
        return new NewConfigItemDialogContextConfiguration();
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        const configurationService = ConfigurationService.getInstance();
        const token = configurationService.getServerConfiguration().BACKEND_API_TOKEN;

        const configItemClassService = KIXObjectServiceRegistry.getServiceInstance(
            KIXObjectType.CONFIG_ITEM_CLASS
        );

        const options = new KIXObjectLoadingOptions(null, null, null, null, null, [
            'CurrentDefinition'
        ]);

        const ciClasses = await configItemClassService.loadObjects<ConfigItemClass>(
            token, null, KIXObjectType.CONFIG_ITEM_CLASS, null, options, null
        );

        for (const ciClass of ciClasses) {
            const formId = ConfigItemFormFactory.getInstance().getFormId(ciClass);
            const existingForm = configurationService.getModuleConfiguration(formId, null);
            if (formId && !existingForm || overwrite) {
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
