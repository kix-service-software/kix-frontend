import { IWidgetFactoryExtension } from '@kix/core/dist/extensions';
import { IWidget, WidgetConfiguration, WidgetSize, WidgetType } from '@kix/core/dist/model';

export class TicketlistWidgetFactoryExtension implements IWidgetFactoryExtension {

    public widgetId: string = "ticket-list-widget";

    public type: WidgetType = WidgetType.CONTENT;

    public getDefaultConfiguration(): any {
        const settings = {
            limit: 10,
            displayLimit: 10,
            showTotalCount: true,
            properties: [
                "TicketNumber",
                "PriorityID",
                "StateID",
                "TypeID",
                "Title",
                "Created",
                "Age"
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
