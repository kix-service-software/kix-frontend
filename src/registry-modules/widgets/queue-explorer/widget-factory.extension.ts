import { IWidgetFactoryExtension } from '@kix/core/dist/extensions';
import { IWidget, WidgetConfiguration, WidgetSize } from '@kix/core/dist/model';
import { QueueExplorer } from './QueueExplorer';

export class TicketInfoWidgetFactoryExtension implements IWidgetFactoryExtension {
    public isSidebar: boolean = true;
    public isContentWidget: boolean = false;
    public widgetId: string = "ticket-queue-explorer";

    public createWidget(): IWidget {
        return new QueueExplorer(this.widgetId);
    }

    public getDefaultConfiguration(): any {
        // TODO: richtiges Icon geben lassen, sobald Widget "definiert" wurde
        return new WidgetConfiguration(this.widgetId, 'Übersicht Queues', [], {}, true, WidgetSize.SMALL, 'minus');
    }

}

module.exports = (data, host, options) => {
    return new TicketInfoWidgetFactoryExtension();
};
