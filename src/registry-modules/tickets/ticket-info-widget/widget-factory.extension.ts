import { TicketInfoWidget } from './TicketInfoWidget';
import { IWidgetFactoryExtension } from '@kix/core/dist/extensions';
import { WidgetType, IWidget, WidgetConfiguration, WidgetSize } from '@kix/core/dist/model';

export class TicketInfoWidgetFactoryExtension implements IWidgetFactoryExtension {

    public widgetId: string = "ticket-info-widget";

    public type: WidgetType = WidgetType.LANE_TAB;

    public createWidget(): IWidget {
        return new TicketInfoWidget(this.widgetId);
    }

    public getDefaultConfiguration(): any {
        return new WidgetConfiguration(
            this.widgetId, 'Ticket-Info', [], {}, this.type, true, WidgetSize.BOTH, 'minus'
        );
    }

}

module.exports = (data, host, options) => {
    return new TicketInfoWidgetFactoryExtension();
};
