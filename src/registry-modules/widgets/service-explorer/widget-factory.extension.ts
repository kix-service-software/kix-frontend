import { IWidgetFactoryExtension } from '@kix/core/dist/extensions';
import { IWidget, WidgetConfiguration, WidgetSize } from '@kix/core/dist/model';
import { ServiceExplorer } from './ServiceExplorer';

export class ServiceExplorerWidgetFactoryExtension implements IWidgetFactoryExtension {
    public isSidebarWidget: boolean = false;
    public isContentWidget: boolean = false;
    public isExplorerWidget: boolean = true;
    public widgetId: string = "ticket-service-explorer";

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
