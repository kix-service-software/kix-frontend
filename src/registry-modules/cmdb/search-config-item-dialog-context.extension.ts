import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import {
    ContextConfiguration, KIXObjectType,
    FormContext, SearchForm, WidgetSize, ConfiguredWidget, WidgetConfiguration, ConfigItemProperty
} from '@kix/core/dist/model';
import { ServiceContainer } from '@kix/core/dist/common';
import { IConfigurationService } from '@kix/core/dist/services';
import { ConfigItemSearchContextConfiguration, ConfigItemSearchContext } from '@kix/core/dist/browser/cmdb';

export class ModuleExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return ConfigItemSearchContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {
        const helpWidget = new ConfiguredWidget('20181022-help-widget', new WidgetConfiguration(
            'help-widget', 'Hilfe', [], {
                helpText: 'Eine <b>Erläuterung zu den Suchoperatoren</b> finden Sie hier: '
                    + '<a href="faqarticles/75" target="_blank">'
                    + 'FAQ#100075 - Hilfe zur Komplexsuche</a>'
            }, false, false, WidgetSize.BOTH, 'kix-icon-query', false
        ));
        const sidebarWidgets = [helpWidget];
        const sidebars = ['20181022-help-widget'];
        return new ConfigItemSearchContextConfiguration(
            ConfigItemSearchContext.CONTEXT_ID, [], sidebars, sidebarWidgets, [], []
        );
    }

    public async createFormDefinitions(): Promise<void> {
        const configurationService =
            ServiceContainer.getInstance().getClass<IConfigurationService>("IConfigurationService");

        const formId = 'search-config-item-form';
        const existingForm = configurationService.getModuleConfiguration(formId, null);
        if (!existingForm) {
            const form = new SearchForm(
                formId,
                'Config Item',
                KIXObjectType.CONFIG_ITEM,
                FormContext.SEARCH,
                null,
                true,
                [
                    ConfigItemProperty.CLASS_ID, ConfigItemProperty.NUMBER
                ]
            );
            await configurationService.saveModuleConfiguration(form.id, null, form);
        }
        configurationService.registerForm([FormContext.SEARCH], KIXObjectType.CONFIG_ITEM, formId);
    }

}

module.exports = (data, host, options) => {
    return new ModuleExtension();
};
