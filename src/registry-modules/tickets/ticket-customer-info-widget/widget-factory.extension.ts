import { IWidgetFactoryExtension } from '@kix/core/dist/extensions';
import { WidgetType, IWidget, WidgetConfiguration, WidgetSize } from '@kix/core/dist/model';

export class TicketInfoWidgetFactoryExtension implements IWidgetFactoryExtension {

    public widgetId: string = "ticket-customer-info-widget";

    public type: WidgetType = WidgetType.SIDEBAR;

    public getDefaultConfiguration(): any {
        return new WidgetConfiguration(
            this.widgetId, 'Kundeninformation', [], {}, false, true, WidgetSize.BOTH, 'customers'
        );
    }

}

module.exports = (data, host, options) => {
    return new TicketInfoWidgetFactoryExtension();
};
