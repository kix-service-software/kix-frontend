import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import {
    WidgetConfiguration, WidgetType, ConfiguredWidget, WidgetSize, DataType, ContextConfiguration
} from '@kix/core/dist/model';
import { TableColumnConfiguration } from '@kix/core/dist/browser';
import { HomeContextConfiguration } from '@kix/core/dist/browser/home';

export class DashboardModuleFactoryExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return "home";
    }

    public getDefaultConfiguration(): ContextConfiguration {

        const ticketListWidget =
            new ConfiguredWidget("20170920101621", new WidgetConfiguration(
                "ticket-list-widget", "Ticket-Liste", [], {
                    limit: 500,
                    displayLimit: 15,
                    showTotalCount: true,
                    tableColumns: [
                        new TableColumnConfiguration('TicketNumber', true, false, true, true, 130),
                        new TableColumnConfiguration('PriorityID', false, true, false, false, 100),
                        new TableColumnConfiguration('StateID', false, true, true, true, 100),
                        new TableColumnConfiguration('QueueID', true, true, true, true, 200),
                        new TableColumnConfiguration('TypeID', true, true, true, true, 100),
                        new TableColumnConfiguration('Title', true, false, true, true, 200),
                        new TableColumnConfiguration(
                            'Created', true, false, true, true, 100, DataType.DATE_TIME
                        ),
                        new TableColumnConfiguration(
                            'Age', true, false, true, true, 100, DataType.DATE_TIME
                        ),
                    ]
                },
                false, true, WidgetSize.SMALL, null, true)
            );

        const content: string[] = ['20170920101621'];
        const contentWidgets = [ticketListWidget];

        return new HomeContextConfiguration(this.getModuleId(), [], [], [], [], content, contentWidgets, []);
    }

}

module.exports = (data, host, options) => {
    return new DashboardModuleFactoryExtension();
};
