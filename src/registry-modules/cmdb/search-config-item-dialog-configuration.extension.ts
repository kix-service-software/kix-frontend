import { IConfigurationExtension } from '../../core/extensions';
import {
    ContextConfiguration, KIXObjectType,
    FormContext, SearchForm, WidgetSize, ConfiguredWidget, WidgetConfiguration, ConfigItemProperty
} from '../../core/model';
import { ConfigItemSearchContextConfiguration, ConfigItemSearchContext } from '../../core/browser/cmdb';
import { ConfigurationService } from '../../core/services';
import { SearchProperty } from '../../core/browser';

export class ModuleExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return ConfigItemSearchContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {
        const helpWidget = new ConfiguredWidget('20181022-help-widget', new WidgetConfiguration(
            'help-widget', 'Translatable#Help', [], {
                // tslint:disable-next-line:max-line-length
                helpText: 'Translatable#The FAQ article <a href=\"faqarticles/2\" target=\"_blank\">How to search in KIX 18?</a> offers a detailed <b>explanation for the search operators<b>'
            }, false, false, WidgetSize.BOTH, 'kix-icon-query', false
        ));
        const sidebarWidgets = [helpWidget];
        const sidebars = ['20181022-help-widget'];
        return new ConfigItemSearchContextConfiguration(
            ConfigItemSearchContext.CONTEXT_ID, [], sidebars, sidebarWidgets, [], []
        );
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const formId = 'search-config-item-form';
        const existingForm = configurationService.getModuleConfiguration(formId, null);
        if (!existingForm || overwrite) {
            const form = new SearchForm(
                formId,
                'Config Item',
                KIXObjectType.CONFIG_ITEM,
                FormContext.SEARCH,
                null,
                [
                    SearchProperty.FULLTEXT, ConfigItemProperty.CLASS_ID,
                    ConfigItemProperty.NAME, ConfigItemProperty.NUMBER
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
