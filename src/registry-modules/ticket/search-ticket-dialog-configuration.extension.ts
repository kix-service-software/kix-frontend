import { IConfigurationExtension } from '@kix/core/dist/extensions';
import { TicketSearchContextConfiguration, TicketSearchContext } from '@kix/core/dist/browser/ticket';
import {
    ContextConfiguration, KIXObjectType, TicketProperty, FormContext, SearchForm,
    ConfiguredWidget, WidgetConfiguration, WidgetSize
} from '@kix/core/dist/model';
import { ConfigurationService } from '@kix/core/dist/services';
import { SearchProperty } from '@kix/core/dist/browser';

export class ModuleExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return TicketSearchContext.CONTEXT_ID;
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
        return new TicketSearchContextConfiguration(
            TicketSearchContext.CONTEXT_ID, [], sidebars, sidebarWidgets, [], []
        );
    }

    public async createFormDefinitions(): Promise<void> {
        const formId = 'search-ticket-form';
        const existingForm = ConfigurationService.getInstance().getModuleConfiguration(formId, null);
        if (!existingForm) {
            const form = new SearchForm(
                formId,
                'Ticketsuche',
                KIXObjectType.TICKET,
                FormContext.SEARCH,
                null,
                [SearchProperty.FULLTEXT, TicketProperty.TITLE, TicketProperty.QUEUE_ID]
            );
            await ConfigurationService.getInstance().saveModuleConfiguration(form.id, null, form);
        }
        ConfigurationService.getInstance().registerForm([FormContext.SEARCH], KIXObjectType.TICKET, formId);
    }

}

module.exports = (data, host, options) => {
    return new ModuleExtension();
};
