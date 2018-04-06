import { IWidgetFactoryExtension } from '@kix/core/dist/extensions';
import { WidgetType, IWidget, WidgetConfiguration, WidgetSize } from '@kix/core/dist/model';

export class TicketDynamicFieldsWidgetFactoryExtension implements IWidgetFactoryExtension {

    public widgetId: string = "ticket-dynamic-fields-widget";

    public type: WidgetType = WidgetType.LANE;

    public getDefaultConfiguration(): any {
        return new WidgetConfiguration(
            this.widgetId, 'Ticket-Dynamic-Fields', [], {}, true, true, WidgetSize.BOTH, 'minus'
        );
    }

}

module.exports = (data, host, options) => {
    return new TicketDynamicFieldsWidgetFactoryExtension();
};
