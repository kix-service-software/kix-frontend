import { IWidgetFactoryExtension } from '@kix/core/dist/extensions';
import { WidgetType, IWidget, WidgetConfiguration, WidgetSize } from '@kix/core/dist/model';

export class QueueExplorerWidgetFactoryExtension implements IWidgetFactoryExtension {

    public widgetId: string = "ticket-queue-explorer";

    public type: WidgetType = WidgetType.EXPLORER;

    public getDefaultConfiguration(): any {
        return new WidgetConfiguration(
            this.widgetId, 'Übersicht Queues', [], {}, this.type, false, true, true, WidgetSize.SMALL
        );
    }
}

module.exports = (data, host, options) => {
    return new QueueExplorerWidgetFactoryExtension();
};
