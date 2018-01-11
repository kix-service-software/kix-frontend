import { TicketInfoWidget } from './TicketInfoWidget';
import { IWidgetFactoryExtension } from '@kix/core/dist/extensions';
import { WidgetType, IWidget, WidgetConfiguration, WidgetSize } from '@kix/core/dist/model';

export class TicketInfoWidgetFactoryExtension implements IWidgetFactoryExtension {

    public widgetId: string = "ticket-info-widget";

    public type: WidgetType = WidgetType.CONTENT;

    public createWidget(): IWidget {
        return new TicketInfoWidget(this.widgetId);
    }

    public getDefaultConfiguration(): any {
        // TODO: richtiges Icon geben lassen, sobald Widget "definiert" wurde
        return new WidgetConfiguration(this.widgetId, 'Ticket-Info', [], {}, true, WidgetSize.SMALL, 'minus');
    }

}

module.exports = (data, host, options) => {
    return new TicketInfoWidgetFactoryExtension();
};
