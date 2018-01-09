import { IWidgetFactoryExtension } from '@kix/core/dist/extensions';
import { WidgetType, IWidget, WidgetConfiguration, WidgetSize } from '@kix/core/dist/model';
import { ServiceExplorer } from './ServiceExplorer';

export class ServiceExplorerWidgetFactoryExtension implements IWidgetFactoryExtension {

    public widgetId: string = "ticket-service-explorer";

    public type: WidgetType = WidgetType.EXPLORER;

    public createWidget(): IWidget {
        return new ServiceExplorer(this.widgetId);
    }

    public getDefaultConfiguration(): any {
        // TODO: Titel übersetzen
        return new WidgetConfiguration(this.widgetId, 'Übersicht Services', [], {}, true, WidgetSize.SMALL);
    }
}

module.exports = (data, host, options) => {
    return new ServiceExplorerWidgetFactoryExtension();
};
