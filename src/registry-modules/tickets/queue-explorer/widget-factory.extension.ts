import { IWidgetFactoryExtension } from '@kix/core/dist/extensions';
import { WidgetType, IWidget, WidgetConfiguration, WidgetSize } from '@kix/core/dist/model';
import { QueueExplorer } from './QueueExplorer';

export class QueueExplorerWidgetFactoryExtension implements IWidgetFactoryExtension {

    public widgetId: string = "ticket-queue-explorer";

    public type: WidgetType = WidgetType.EXPLORER;

    public createWidget(): IWidget {
        return new QueueExplorer(this.widgetId);
    }

    public getDefaultConfiguration(): any {
        // TODO: Titel übersetzen
        return new WidgetConfiguration(this.widgetId, 'Übersicht Queues', [], {}, this.type, true, WidgetSize.SMALL);
    }
}

module.exports = (data, host, options) => {
    return new QueueExplorerWidgetFactoryExtension();
};
