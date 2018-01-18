import { IWidgetFactoryExtension } from '@kix/core/dist/extensions';
import { WidgetType, IWidget, WidgetConfiguration, WidgetSize } from '@kix/core/dist/model';

export class ServiceExplorerWidgetFactoryExtension implements IWidgetFactoryExtension {

    public widgetId: string = "ticket-service-explorer";

    public type: WidgetType = WidgetType.EXPLORER;

    public getDefaultConfiguration(): any {
        // TODO: Titel übersetzen
        return new WidgetConfiguration(this.widgetId, 'Übersicht Services', [], {}, this.type, true, WidgetSize.SMALL);
    }
}

module.exports = (data, host, options) => {
    return new ServiceExplorerWidgetFactoryExtension();
};
