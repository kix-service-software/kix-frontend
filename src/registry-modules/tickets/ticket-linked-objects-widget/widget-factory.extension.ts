import { IWidgetFactoryExtension } from '@kix/core/dist/extensions';
import { WidgetType, IWidget, WidgetConfiguration, WidgetSize, SortType } from '@kix/core/dist/model';
import { StandardTableColumn, ColumnDataType } from '@kix/core/dist/browser';

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
                            new StandardTableColumn('TicketNumber', '', true, true, false, true, true, 100),
                            new StandardTableColumn('Title', '', true, true, false, true, true, 100),
                            new StandardTableColumn('TypeID', 'TypeID', true, true, false, true, true, 100),
                            new StandardTableColumn('QueueID', 'QueueID', true, true, false, true, true, 100),
                            new StandardTableColumn('StateID', 'TicketState', true, false, true, true, true, 100),
                            new StandardTableColumn(
                                'Created', 'Created',
                                true, true, false, true, true, 100,
                                ColumnDataType.DATE_TIME, SortType.DATE_TIME
                            ),
                            new StandardTableColumn('LinkedAs', 'LinkedAs', false, true, false, true, true, 100)
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
