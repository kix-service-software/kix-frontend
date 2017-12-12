import { SearchTemplatesWidget } from './SearchTemplatesWidget';
import { IWidgetFactoryExtension } from '@kix/core/dist/extensions';
import { IWidget, WidgetConfiguration, WidgetSize } from '@kix/core/dist/model';

export class SearchTemplatesWidgetFactoryExtension implements IWidgetFactoryExtension {
    public isSidebar: boolean = false;
    public isContentWidget: boolean = true;
    public widgetId: string = "search-templates-widget";

    public createWidget(): IWidget {
        return new SearchTemplatesWidget(this.widgetId);
    }

    public getDefaultConfiguration(): any {
        return new WidgetConfiguration(this.widgetId, 'Suchvorlagen', [], {}, true, WidgetSize.SMALL);
    }

}

module.exports = (data, host, options) => {
    return new SearchTemplatesWidgetFactoryExtension();
};
