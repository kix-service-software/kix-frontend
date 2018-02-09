import { IWidgetFactoryExtension } from '@kix/core/dist/extensions';
import { WidgetType, IWidget, WidgetConfiguration, WidgetSize } from '@kix/core/dist/model';

export class TicketLinkedObjectsWidgetFactoryExtension implements IWidgetFactoryExtension {

    public widgetId: string = "ticket-linked-objects-widget";

    public type: WidgetType = WidgetType.LANE;

    public getDefaultConfiguration(): any {
        return new WidgetConfiguration(
            this.widgetId, 'Verknüpfte Objekte', [], {}, this.type, true, true, true, WidgetSize.BOTH, 'minus'
        );
    }

}

module.exports = (data, host, options) => {
    return new TicketLinkedObjectsWidgetFactoryExtension();
};
