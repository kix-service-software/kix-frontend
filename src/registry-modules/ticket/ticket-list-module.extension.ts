import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import {
    ConfiguredWidget, WidgetConfiguration, WidgetSize, FilterCriteria, FilterDataType, FilterType
} from '@kix/core/dist/model';
import { TicketListContext, TicketListContextConfiguration } from '@kix/core/dist/browser/ticket';
import {
    ToggleOptions, TableHeaderHeight, TableRowHeight, TableConfiguration, SearchOperator
} from '@kix/core/dist/browser';

export class TicketModuleFactoryExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return TicketListContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): any {

        const ticketListWidget =
            new ConfiguredWidget('20180927-ticket-list-widget', new WidgetConfiguration(
                'ticket-list-widget', 'Tickets', [
                    'ticket-create-action', 'ticket-search-action', 'csv-export-action'
                ], new TableConfiguration(
                    2500, 25, null, [new FilterCriteria(
                        'StateType', SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, 'Open'
                    )],
                    true, true,
                    new ToggleOptions('ticket-article-details', 'article', [], true),
                    null, TableHeaderHeight.LARGE, TableRowHeight.LARGE
                ),
                false, false, WidgetSize.LARGE, null, true, [])
            );

        const content = ['20180927-ticket-list-widget'];
        const contentWidgets = [ticketListWidget];

        return new TicketListContextConfiguration(
            this.getModuleId(), [], [], [], [], content, contentWidgets, []
        );
    }

    public async createFormDefinitions(): Promise<void> {
        return;
    }

}

module.exports = (data, host, options) => {
    return new TicketModuleFactoryExtension();
};
