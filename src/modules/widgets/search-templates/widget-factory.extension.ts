import { SearchTemplatesWidget } from './SearchTemplatesWidget';
import { IWidgetFactoryExtension, IWidget } from '@kix/core';

export class SearchTemplatesWidgetFactoryExtension implements IWidgetFactoryExtension {

    public createWidget(): IWidget {
        return new SearchTemplatesWidget(this.getWidgetId());
    }

    public getWidgetId(): string {
        return "search-templates-widget";
    }

    public getDefaultConfiguration(): any {
        return {};
    }

}

module.exports = (data, host, options) => {
    return new SearchTemplatesWidgetFactoryExtension();
};
