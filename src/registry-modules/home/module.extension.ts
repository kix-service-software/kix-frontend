import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import {
    WidgetConfiguration, WidgetType, ConfiguredWidget, WidgetSize, DataType, ContextConfiguration
} from '@kix/core/dist/model';
import { TableColumnConfiguration } from '@kix/core/dist/browser';
import { HomeContextConfiguration, HomeContext } from '@kix/core/dist/browser/home';
import { TicketProperty } from '@kix/core/dist/model/';

export class DashboardModuleFactoryExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return HomeContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {

        const ticketListWidget =
            new ConfiguredWidget("20170920101621", new WidgetConfiguration(
                "ticket-list-widget", "Ticket-Liste", [], {
                    limit: 500,
                    displayLimit: 15,
                    showTotalCount: true,
                    tableColumns: [
                        new TableColumnConfiguration(TicketProperty.TICKET_NUMBER, true, false, true, true, 130),
                        new TableColumnConfiguration(TicketProperty.PRIORITY_ID, false, true, false, false, 100),
                        new TableColumnConfiguration(TicketProperty.STATE_ID, false, true, true, true, 100),
                        new TableColumnConfiguration(TicketProperty.QUEUE_ID, true, true, true, true, 200),
                        new TableColumnConfiguration(TicketProperty.TYPE_ID, true, true, true, true, 100),
                        new TableColumnConfiguration(TicketProperty.TITLE, true, false, true, true, 200),
                        new TableColumnConfiguration(
                            TicketProperty.CREATED, true, false, true, true, 100, DataType.DATE_TIME
                        ),
                        new TableColumnConfiguration(
                            TicketProperty.AGE, true, false, true, true, 100, DataType.DATE_TIME
                        ),
                    ]
                },
                false, true, WidgetSize.SMALL, null, true)
            );

        const content: string[] = ['20170920101621'];
        const contentWidgets = [ticketListWidget];

        return new HomeContextConfiguration(this.getModuleId(), [], [], [], [], content, contentWidgets, []);
    }

    public createFormDefinitions(): void {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new DashboardModuleFactoryExtension();
};
