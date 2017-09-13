import { SearchTemplatesWidget } from './SearchTemplatesWidget';
import { IWidget } from './../../../model/client/components/widget/IWidget';
import { IWidgetFactoryExtension } from './../../../extensions/IWidgetFactoryExtension';

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
