import { IWidgetFactoryExtension } from '@kix/core/dist/extensions';
import { IWidget, WidgetConfiguration, WidgetSize, WidgetType } from '@kix/core/dist/model';
import { StandardTableColumn } from '@kix/core/dist/browser';

export class TicketlistWidgetFactoryExtension implements IWidgetFactoryExtension {

    public widgetId: string = "ticket-list-widget";

    public type: WidgetType = WidgetType.CONTENT;

    public getDefaultConfiguration(): any {
        const settings = {
            limit: 10,
            displayLimit: 10,
            showTotalCount: true,
            tableColumns: [
                new StandardTableColumn('TicketNumber', '', true, true, false, true, true, 130),
                new StandardTableColumn('PriorityID', 'Priority', true, false, true, false, false, 100),
                new StandardTableColumn('StateID', 'TicketState', true, false, true, true, true, 100),
                new StandardTableColumn('TypeID', '', true, true, true, true, true, 100),
                new StandardTableColumn('Title', '', true, true, false, true, true, 200),
                new StandardTableColumn('Created', '', true, true, false, true, true, 100),
                new StandardTableColumn('Age', '', true, true, false, true, true, 100),
            ]
        };

        return new WidgetConfiguration(
            this.widgetId, 'Ticket-Liste', [], settings, this.type, false, true, true, WidgetSize.LARGE
        );
    }

}

module.exports = (data, host, options) => {
    return new TicketlistWidgetFactoryExtension();
};
