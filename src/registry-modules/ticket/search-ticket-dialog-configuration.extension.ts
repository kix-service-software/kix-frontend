import { IConfigurationExtension } from '../../core/extensions';
import { TicketSearchContextConfiguration, TicketSearchContext } from '../../core/browser/ticket';
import {
    ContextConfiguration, KIXObjectType, TicketProperty, FormContext, SearchForm,
    ConfiguredWidget, WidgetConfiguration, WidgetSize
} from '../../core/model';
import { ConfigurationService } from '../../core/services';
import { SearchProperty } from '../../core/browser';

export class ModuleExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return TicketSearchContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {
        const helpWidget = new ConfiguredWidget('20180919-help-widget', new WidgetConfiguration(
            'help-widget', 'Translatable#Help', [], {
                // tslint:disable-next-line:max-line-length
                helpText: 'Translatable#The FAQ article <a href=\"faqarticles/2\" target=\"_blank\">How to search in KIX 18?</a> offers a detailed <b>explanation for the search operators<b>'
            }, false, false, WidgetSize.BOTH, 'kix-icon-query', false
        ));
        const sidebarWidgets = [helpWidget];
        const sidebars = ['20180919-help-widget'];
        return new TicketSearchContextConfiguration(
            TicketSearchContext.CONTEXT_ID, [], sidebars, sidebarWidgets, [], []
        );
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        const formId = 'search-ticket-form';
        const existingForm = ConfigurationService.getInstance().getModuleConfiguration(formId, null);
        if (!existingForm || overwrite) {
            const form = new SearchForm(
                formId,
                'Ticket Search',
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
