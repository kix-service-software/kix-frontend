/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ContextConfiguration, ConfigItemClass, KIXObjectType, KIXObjectLoadingOptions } from "../../core/model";
import { IConfigurationExtension } from "../../core/extensions";
import { ConfigurationService, KIXObjectServiceRegistry } from "../../core/services";
import { NewConfigItemDialogContext, ConfigItemFormFactory } from "../../core/browser/cmdb";

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewConfigItemDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {
        return new ContextConfiguration(NewConfigItemDialogContext.CONTEXT_ID);
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
            const formId = ConfigItemFormFactory.getInstance().getFormId(ciClass);
            const existingForm = configurationService.getConfiguration(formId);
            if (formId && !existingForm || overwrite) {
                const form = await ConfigItemFormFactory.getInstance().createCIForm(ciClass, formId);
                await configurationService.saveConfiguration(formId, form);
            }
            configurationService.registerFormId(formId);
        }
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
