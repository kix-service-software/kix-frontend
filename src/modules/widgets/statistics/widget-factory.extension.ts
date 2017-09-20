import { IWidgetFactoryExtension, IWidget } from '@kix/core';
import { StatisticWidget } from './StatisticsWidget';

export class StatisticsWidgetFactoryExtension implements IWidgetFactoryExtension {

    public createWidget(): IWidget {
        return new StatisticWidget(this.getWidgetId());
    }

    public getWidgetId(): string {
        return "statistics-widget";
    }

    public getTemplate(): string {
        const packageJson = require('../../../../package.json');
        const version = packageJson.version;
        return '/@kix/frontend$' + version + '/dist/components/widgets/statistics';
    }

    public getDefaultConfiguration(): any {
        return {};
    }

}

module.exports = (data, host, options) => {
    return new StatisticsWidgetFactoryExtension();
};
