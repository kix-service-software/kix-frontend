import { ChartWidget } from './ChartWidget';
import { IWidget, IWidgetFactoryExtension, WidgetConfiguration, ChartSettings } from '@kix/core';

export class ChartWidgetFactoryExtension implements IWidgetFactoryExtension {
    public isSidebar: boolean = false;
    public isContentWidget: boolean = true;
    public widgetId: string = "chart-widget";

    public createWidget(): IWidget {
        return new ChartWidget(this.widgetId);
    }

    public getTemplate(): string {
        const packageJson = require('../../../../package.json');
        const version = packageJson.version;
        return '/@kix/frontend$' + version + '/dist/components/widgets/chart';
    }

    public getConfigurationTemplate(): string {
        return this.getTemplate() + '/configuration';
    }

    public getDefaultConfiguration(): WidgetConfiguration {
        const chartConfig = new ChartSettings();
        return new WidgetConfiguration("Chart", [], chartConfig);
    }

}

module.exports = (data, host, options) => {
    return new ChartWidgetFactoryExtension();
};
