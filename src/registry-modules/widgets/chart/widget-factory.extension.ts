import { ChartWidget } from './ChartWidget';
import { IWidget, WidgetConfiguration, WidgetSize } from '@kix/core/dist/model';
import { IWidgetFactoryExtension } from '@kix/core/dist/extensions';
import { ChartSettings } from '@kix/core/dist/browser/model/charts';

export class ChartWidgetFactoryExtension implements IWidgetFactoryExtension {
    public isSidebarWidget: boolean = false;
    public isContentWidget: boolean = true;
    public isExplorerWidget: boolean = false;
    public widgetId: string = "chart-widget";

    public createWidget(): IWidget {
        return new ChartWidget(this.widgetId);
    }

    public getDefaultConfiguration(): WidgetConfiguration {
        const chartConfig = new ChartSettings();
        return new WidgetConfiguration(this.widgetId, "Chart", [], chartConfig, true, WidgetSize.SMALL);
    }

}

module.exports = (data, host, options) => {
    return new ChartWidgetFactoryExtension();
};
