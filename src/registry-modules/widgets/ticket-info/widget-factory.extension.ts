import { TicketInfoWidget } from './TicketInfoWidget';
import { IWidgetFactoryExtension } from '@kix/core/dist/extensions';
import { IWidget, WidgetConfiguration, WidgetSize } from '@kix/core/dist/model';

export class TicketInfoWidgetFactoryExtension implements IWidgetFactoryExtension {
    public isSidebar: boolean = true;
    public isContentWidget: boolean = false;
    public widgetId: string = "ticket-info-widget";

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
