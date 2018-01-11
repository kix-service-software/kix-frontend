import { SearchTemplatesWidget } from './SearchTemplatesWidget';
import { IWidgetFactoryExtension } from '@kix/core/dist/extensions';
import { WidgetType, IWidget, WidgetConfiguration, WidgetSize } from '@kix/core/dist/model';

export class SearchTemplatesWidgetFactoryExtension implements IWidgetFactoryExtension {

    public widgetId: string = "search-templates-widget";

    public type: WidgetType = WidgetType.CONTENT;

    public createWidget(): IWidget {
        return new SearchTemplatesWidget(this.widgetId);
    }

    public getDefaultConfiguration(): any {
        return new WidgetConfiguration(this.widgetId, 'Suchvorlagen', [], {}, this.type, true, WidgetSize.SMALL);
    }

}

module.exports = (data, host, options) => {
    return new SearchTemplatesWidgetFactoryExtension();
};
