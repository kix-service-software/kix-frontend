import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import { TicketSearchContextConfiguration, TicketSearchContext } from '@kix/core/dist/browser/ticket';
import {
    ContextConfiguration, KIXObjectType, TicketProperty, FormContext, SearchForm,
    ConfiguredWidget, WidgetConfiguration, WidgetSize
} from '@kix/core/dist/model';
import { ServiceContainer } from '@kix/core/dist/common';
import { IConfigurationService } from '@kix/core/dist/services';

export class ModuleExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return TicketSearchContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {
        const helpWidget = new ConfiguredWidget('20180919-help-widget', new WidgetConfiguration(
            'help-widget', 'Hilfe', [], {
                helpText: 'Eine <b>Erläuterung zu den Suchoperatoren</b> finden Sie hier: '
                    + '<a href="faqarticles/3" target="_blank">'
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
        const configurationService =
            ServiceContainer.getInstance().getClass<IConfigurationService>("IConfigurationService");

        const formId = 'search-ticket-form';
        const existingForm = configurationService.getModuleConfiguration(formId, null);
        if (!existingForm) {
            const form = new SearchForm(
                formId,
                'Ticketsuche',
                KIXObjectType.TICKET,
                FormContext.SEARCH,
                null,
                true,
                [TicketProperty.TITLE, TicketProperty.QUEUE_ID]
            );
            await configurationService.saveModuleConfiguration(form.id, null, form);
        }
        configurationService.registerForm([FormContext.SEARCH], KIXObjectType.TICKET, formId);
    }

}

module.exports = (data, host, options) => {
    return new ModuleExtension();
};
