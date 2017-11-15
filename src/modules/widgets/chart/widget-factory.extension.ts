import { ChartWidget } from './ChartWidget';
import { IWidget, IWidgetFactoryExtension, WidgetConfiguration, ChartConfiguration } from '@kix/core';

export class ChartWidgetFactoryExtension implements IWidgetFactoryExtension {
    isSidebar: boolean = false;
    isContentWidget: boolean = true;

    public createWidget(): IWidget {
        return new ChartWidget(this.getWidgetId());
    }

    public getWidgetId(): string {
        return "chart-widget";
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
        const chartConfig = new ChartConfiguration();
        return new WidgetConfiguration("Chart", [], chartConfig);
    }

}

module.exports = (data, host, options) => {
    return new ChartWidgetFactoryExtension();
};
