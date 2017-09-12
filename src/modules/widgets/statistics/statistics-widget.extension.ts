import { IWidget } from './../../../model/client/components/widget/IWidget';
import { IWidgetFactoryExtension } from './../../../extensions/IWidgetFactoryExtension';
import { StatisticWidget } from './StatisticsWidget';

export class StatisticsWidgetFactoryExtension implements IWidgetFactoryExtension {

    public createWidget(): IWidget {
        return new StatisticWidget();
    }

    public getWidgetId(): string {
        return "statistics-widget";
    }

    public getDefaultConfiguration(): any {
        return {};
    }

}

module.exports = (data, host, options) => {
    return new StatisticsWidgetFactoryExtension();
};
