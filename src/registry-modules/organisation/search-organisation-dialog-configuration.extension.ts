import { IConfigurationExtension } from '../../core/extensions';
import {
    ContextConfiguration, KIXObjectType,
    FormContext, SearchForm, OrganisationProperty, WidgetSize, ConfiguredWidget, WidgetConfiguration
} from '../../core/model';
import { ConfigurationService } from '../../core/services';
import { SearchProperty } from '../../core/browser';
import { OrganisationSearchContext } from '../../core/browser/organisation';

export class ModuleExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return OrganisationSearchContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {
        const helpWidget = new ConfiguredWidget('20180919-help-widget', new WidgetConfiguration(
            'help-widget', 'Translatable#Help', [], { helpText: 'Translatable#Helptext_Search_Organisation' },
            false, false, WidgetSize.BOTH, 'kix-icon-query', false
        ));
        const sidebarWidgets = [helpWidget];
        const sidebars = ['20180919-help-widget'];
        return new ContextConfiguration(
            OrganisationSearchContext.CONTEXT_ID, sidebars, sidebarWidgets
        );
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const formId = 'search-organisation-form';
        const existingForm = configurationService.getModuleConfiguration(formId, null);
        if (!existingForm || overwrite) {
            const form = new SearchForm(
                formId,
                'Translatable#Organisations',
                KIXObjectType.ORGANISATION,
                FormContext.SEARCH,
                null,
                [SearchProperty.FULLTEXT, OrganisationProperty.NAME, OrganisationProperty.ID]
            );
            await configurationService.saveModuleConfiguration(form.id, null, form);
        }
        configurationService.registerForm([FormContext.SEARCH], KIXObjectType.ORGANISATION, formId);
    }

}

module.exports = (data, host, options) => {
    return new ModuleExtension();
};
