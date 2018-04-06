import { IWidgetFactoryExtension } from '@kix/core/dist/extensions';
import { IWidget, WidgetConfiguration, WidgetSize, WidgetType, DataType } from '@kix/core/dist/model';
import { TableColumnConfiguration } from '@kix/core/dist/browser';

export class TicketlistWidgetFactoryExtension implements IWidgetFactoryExtension {

    public widgetId: string = "ticket-list-widget";

    public type: WidgetType = WidgetType.CONTENT;

    public getDefaultConfiguration(): any {
        const settings = {
            limit: 10,
            displayLimit: 10,
            showTotalCount: true,
            tableColumns: [
                new TableColumnConfiguration('TicketNumber', true, false, true, true, 130),
                new TableColumnConfiguration('PriorityID', false, true, false, false, 100),
                new TableColumnConfiguration('StateID', false, true, true, true, 100),
                new TableColumnConfiguration('TypeID', true, true, true, true, 100),
                new TableColumnConfiguration('Title', true, false, true, true, 200),
                new TableColumnConfiguration(
                    'Created', true, false, true, true, 100, DataType.DATE_TIME
                ),
                new TableColumnConfiguration(
                    'Age', true, false, true, true, 100, DataType.DATE_TIME
                ),
            ]
        };

        return new WidgetConfiguration(
            this.widgetId, 'Ticket-Liste', [], settings, false, true, WidgetSize.LARGE
        );
    }

}

module.exports = (data, host, options) => {
    return new TicketlistWidgetFactoryExtension();
};
