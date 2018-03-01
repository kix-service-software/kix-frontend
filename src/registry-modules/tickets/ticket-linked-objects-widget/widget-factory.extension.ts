import { IWidgetFactoryExtension } from '@kix/core/dist/extensions';
import { WidgetType, IWidget, WidgetConfiguration, WidgetSize, DataType } from '@kix/core/dist/model';
import { TableColumnConfiguration } from '@kix/core/dist/browser';

export class TicketLinkedObjectsWidgetFactoryExtension implements IWidgetFactoryExtension {

    public widgetId: string = "ticket-linked-objects-widget";

    public type: WidgetType = WidgetType.LANE;

    public getDefaultConfiguration(): any {
        return new WidgetConfiguration(
            this.widgetId, 'Verknüpfte Objekte', ['print-ticket-action', 'edit-ticket-action'],
            {
                groups: [
                    [
                        "Ticket", [
                            new TableColumnConfiguration('TicketNumber', true, false, true, true, 100),
                            new TableColumnConfiguration('Title', true, false, true, true, 100),
                            new TableColumnConfiguration('TypeID', true, false, true, true, 100),
                            new TableColumnConfiguration('QueueID', true, false, true, true, 100),
                            new TableColumnConfiguration('StateID', false, true, true, true, 100),
                            new TableColumnConfiguration(
                                'Created', true, false, true, true, 100, DataType.DATE_TIME
                            ),
                            new TableColumnConfiguration('LinkedAs', true, false, true, true, 100)
                        ]
                    ]
                ]
            },
            this.type, true, true, true, WidgetSize.BOTH, 'minus'
        );
    }

}

module.exports = (data, host, options) => {
    return new TicketLinkedObjectsWidgetFactoryExtension();
};
