import { IConfigurationExtension } from '@kix/core/dist/extensions';
import {
    ContextConfiguration, KIXObjectType,
    FormContext, SearchForm, CustomerProperty, WidgetSize, ConfiguredWidget, WidgetConfiguration
} from '@kix/core/dist/model';
import { CustomerSearchContext, CustomerSearchContextConfiguration } from '@kix/core/dist/browser/customer';
import { ConfigurationService } from '@kix/core/dist/services';
import { SearchProperty } from '@kix/core/dist/browser';

export class ModuleExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return CustomerSearchContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {
        const helpWidget = new ConfiguredWidget('20180919-help-widget', new WidgetConfiguration(
            'help-widget', 'Hilfe', [], {
                helpText: 'Eine <b>Erläuterung zu den Suchoperatoren</b> finden Sie hier: '
                    + '<a href="faqarticles/2" target="_blank">'
                    + 'Wie suche ich in KIX 18?</a>'
            }, false, false, WidgetSize.BOTH, 'kix-icon-query', false
        ));
        const sidebarWidgets = [helpWidget];
        const sidebars = ['20180919-help-widget'];
        return new CustomerSearchContextConfiguration(
            CustomerSearchContext.CONTEXT_ID, [], sidebars, sidebarWidgets, [], []
        );
    }

    public async createFormDefinitions(): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const formId = 'search-customer-form';
        const existingForm = configurationService.getModuleConfiguration(formId, null);
        if (!existingForm) {
            const form = new SearchForm(
                formId,
                'Kunden',
                KIXObjectType.CUSTOMER,
                FormContext.SEARCH,
                null,
                [SearchProperty.FULLTEXT, CustomerProperty.CUSTOMER_COMPANY_NAME, CustomerProperty.CUSTOMER_ID]
            );
            await configurationService.saveModuleConfiguration(form.id, null, form);
        }
        configurationService.registerForm([FormContext.SEARCH], KIXObjectType.CUSTOMER, formId);
    }

}

module.exports = (data, host, options) => {
    return new ModuleExtension();
};
