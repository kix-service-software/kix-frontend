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
    ConfiguredWidget, WidgetConfiguration, WidgetSize, FilterCriteria, FilterDataType,
    FilterType, KIXObjectType, ContextConfiguration, KIXObjectLoadingOptions
} from '../../core/model';
import { TicketListContext } from '../../core/browser/ticket';
import {
    ToggleOptions, TableHeaderHeight, TableRowHeight, TableConfiguration, SearchOperator
} from '../../core/browser';

export class TicketModuleFactoryExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return TicketListContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const ticketListWidget =
            new ConfiguredWidget('20180927-ticket-list-widget', new WidgetConfiguration(
                'table-widget', 'Translatable#Tickets', [
                    'bulk-action', 'ticket-create-action', 'ticket-search-action', 'csv-export-action'
                ],
                {
                    objectType: KIXObjectType.TICKET,
                    tableConfiguration: new TableConfiguration(
                        KIXObjectType.TICKET,
                        new KIXObjectLoadingOptions([
                            new FilterCriteria(
                                'StateType', SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, 'Open'
                            )
                        ]),
                        null, null,
                        true, true,
                        new ToggleOptions('ticket-article-details', 'article', [], true),
                        null, TableHeaderHeight.LARGE, TableRowHeight.LARGE
                    )
                },
                false, false, null, true)
            );

        const content = ['20180927-ticket-list-widget'];
        const contentWidgets = [ticketListWidget];

        const notesSidebar =
            new ConfiguredWidget('20181010-ticket-notes', new WidgetConfiguration(
                'notes-widget', 'Translatable#Notes', [], {},
                false, false, 'kix-icon-note', false)
            );

        const sidebars = ['20181010-ticket-notes'];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [notesSidebar];

        return new ContextConfiguration(
            this.getModuleId(),
            sidebars, sidebarWidgets,
            [], [],
            [], [],
            content, contentWidgets
        );
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        return;
    }

}

module.exports = (data, host, options) => {
    return new TicketModuleFactoryExtension();
};
