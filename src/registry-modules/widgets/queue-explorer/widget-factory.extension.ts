import { IWidgetFactoryExtension } from '@kix/core/dist/extensions';
import { IWidget, WidgetConfiguration, WidgetSize } from '@kix/core/dist/model';
import { QueueExplorer } from './QueueExplorer';

export class QueueExplorerWidgetFactoryExtension implements IWidgetFactoryExtension {
    public isSidebarWidget: boolean = false;
    public isContentWidget: boolean = false;
    public isExplorerWidget: boolean = true;
    public widgetId: string = "ticket-queue-explorer";

    public createWidget(): IWidget {
        return new QueueExplorer(this.widgetId);
    }

    public getDefaultConfiguration(): any {
        // TODO: Titel übersetzen
        return new WidgetConfiguration(this.widgetId, 'Übersicht Queues', [], {}, true, WidgetSize.SMALL);
    }
}

module.exports = (data, host, options) => {
    return new QueueExplorerWidgetFactoryExtension();
};
