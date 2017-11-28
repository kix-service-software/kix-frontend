import { ChartWidget } from './ChartWidget';
import { IWidget, WidgetConfiguration, WidgetSize } from '@kix/core/dist/model';
import { IWidgetFactoryExtension } from '@kix/core/dist/extensions';
import { ChartSettings } from '@kix/core/dist/browser/model/charts';

export class ChartWidgetFactoryExtension implements IWidgetFactoryExtension {
    public isSidebar: boolean = false;
    public isContentWidget: boolean = true;
    public widgetId: string = "chart-widget";
    public size: WidgetSize = WidgetSize.SMALL;

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
        return new WidgetConfiguration(this.widgetId, "Chart", [], chartConfig, true, WidgetSize.SMALL);
    }

}

module.exports = (data, host, options) => {
    return new ChartWidgetFactoryExtension();
};
