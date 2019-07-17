import { IConfigurationExtension } from '../../core/extensions';
import {
    ContextConfiguration, KIXObjectType,
    FormContext, SearchForm, OrganisationProperty, WidgetSize, ConfiguredWidget, WidgetConfiguration, CRUD
} from '../../core/model';
import { ConfigurationService } from '../../core/services';
import { SearchProperty } from '../../core/browser';
import { OrganisationSearchContext } from '../../core/browser/organisation';
import { UIComponentPermission } from '../../core/model/UIComponentPermission';

export class ModuleExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return OrganisationSearchContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {
        const helpWidget = new ConfiguredWidget('20180919-help-widget',
            new WidgetConfiguration(
                'help-widget', 'Translatable#Help', [], { helpText: 'Translatable#Helptext_Search_Organisation' },
                false, false, 'kix-icon-query', false
            ),
            [new UIComponentPermission('faq/articles', [CRUD.READ])]
        );
        const sidebarWidgets = [helpWidget];
        const sidebars = ['20180919-help-widget'];
        return new ContextConfiguration(
            OrganisationSearchContext.CONTEXT_ID, sidebars, sidebarWidgets
        );
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const formId = 'search-organisation-form';
        const existingForm = configurationService.getConfiguration(formId);
        if (!existingForm || overwrite) {
            const form = new SearchForm(
                formId,
                'Translatable#Organisations',
                KIXObjectType.ORGANISATION,
                FormContext.SEARCH,
                null,
                [SearchProperty.FULLTEXT, OrganisationProperty.NAME, OrganisationProperty.ID]
            );
            await configurationService.saveConfiguration(form.id, form);
        }
        configurationService.registerForm([FormContext.SEARCH], KIXObjectType.ORGANISATION, formId);
    }

}

module.exports = (data, host, options) => {
    return new ModuleExtension();
};
