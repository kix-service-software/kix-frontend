import { IWidgetFactoryExtension } from '@kix/core/dist/extensions';
import { WidgetType, IWidget, WidgetConfiguration, WidgetSize } from '@kix/core/dist/model';
import { TicketDescriptionWidget } from './TicketDescriptionWidget';

export class TicketDescriptionWidgetFactoryExtension implements IWidgetFactoryExtension {

    public widgetId: string = "ticket-history-widget";

    public type: WidgetType = WidgetType.LANE;

    public createWidget(): IWidget {
        return new TicketDescriptionWidget(this.widgetId);
    }

    public getDefaultConfiguration(): any {
        return new WidgetConfiguration(
            this.widgetId, 'Ticket-Description', [], {}, this.type, true, WidgetSize.BOTH, 'minus'
        );
    }

}

module.exports = (data, host, options) => {
    return new TicketDescriptionWidgetFactoryExtension();
};
