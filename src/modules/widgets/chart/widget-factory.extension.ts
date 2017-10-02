import { IWidget, IWidgetFactoryExtension } from '@kix/core';

import { ChartWidget } from './ChartWidget';

export class ChartWidgetFactoryExtension implements IWidgetFactoryExtension {

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

    public getDefaultConfiguration(): any {
        return {};
    }

}

module.exports = (data, host, options) => {
    return new ChartWidgetFactoryExtension();
};
