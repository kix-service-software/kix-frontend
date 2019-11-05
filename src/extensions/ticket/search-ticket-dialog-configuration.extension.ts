/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../core/extensions';
import {
    ContextConfiguration, KIXObjectType, TicketProperty, FormContext, SearchForm,
    ConfiguredWidget, WidgetConfiguration, CRUD, HelpWidgetConfiguration, ContextMode, ConfiguredDialogWidget
} from '../../core/model';
import { ConfigurationService } from '../../core/services';
import { SearchProperty } from '../../core/browser';
import { TicketSearchContext } from '../../core/browser/ticket';
import { UIComponentPermission } from '../../core/model/UIComponentPermission';
import { ConfigurationType, ConfigurationDefinition } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class ModuleExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return TicketSearchContext.CONTEXT_ID;
    }

    public async createDefaultConfiguration(): Promise<ContextConfiguration> {

        const helpConfig = new HelpWidgetConfiguration(
            'ticket-search-help-widget-config', 'Help WIdget Config', ConfigurationType.HelpWidget,
            'Translatable#Helptext_Search_Ticket',
            []
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(helpConfig);

        const helpWidget = new WidgetConfiguration(
            'ticket-search-help-widget', 'Help Widget', ConfigurationType.Widget,
            'help-widget', 'Translatable#Help', [],
            new ConfigurationDefinition('ticket-search-help-widget-config', ConfigurationType.HelpWidget),
            null, false, false, 'kix-icon-query', false
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(helpWidget);

        const widget = new WidgetConfiguration(
            'ticket-search-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'search-ticket-dialog', 'Translatable#Ticket Search', [], null, null,
            false, false, 'kix-icon-search-ticket'
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(widget);

        return new ContextConfiguration(
            'ticket-search-dialog', 'Ticket Search Dialog', ConfigurationType.Context,
            TicketSearchContext.CONTEXT_ID,
            [
                new ConfiguredWidget(
                    'ticket-search-help-widget', 'ticket-search-help-widget', null,
                    [new UIComponentPermission('faq/articles', [CRUD.READ])]
                )
            ],
            [], [], [], [], [], [], [],
            [
                new ConfiguredDialogWidget(
                    'ticket-search-dialog-widget', 'ticket-search-dialog-widget',
                    KIXObjectType.TICKET, ContextMode.SEARCH
                )
            ]
        );
    }

    public async createFormConfigurations(overwrite: boolean): Promise<void> {
        const formId = 'ticket-search-form';
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new SearchForm(
                formId, 'Ticket Search', KIXObjectType.TICKET, FormContext.SEARCH, null,
                [SearchProperty.FULLTEXT, TicketProperty.TITLE, TicketProperty.QUEUE_ID]
            )
        );
        ConfigurationService.getInstance().registerForm([FormContext.SEARCH], KIXObjectType.TICKET, formId);
    }

}

module.exports = (data, host, options) => {
    return new ModuleExtension();
};
