import { SearchTemplatesWidget } from './SearchTemplatesWidget';
import { IWidgetFactoryExtension } from '@kix/core/dist/extensions';
import { IWidget, WidgetConfiguration, WidgetSize } from '@kix/core/dist/model';

export class SearchTemplatesWidgetFactoryExtension implements IWidgetFactoryExtension {
    public isSidebar: boolean = false;
    public isContentWidget: boolean = true;
    public widgetId: string = "search-templates-widget";
    public size: WidgetSize = WidgetSize.SMALL;

    public createWidget(): IWidget {
        return new SearchTemplatesWidget(this.widgetId);
    }

    public getTemplate(): string {
        const packageJson = require('../../../../package.json');
        const version = packageJson.version;
        return '/@kix/frontend$' + version + '/dist/components/widgets/search-templates';
    }

    public getConfigurationTemplate(): string {
        return this.getTemplate() + '/configuration';
    }

    public getDefaultConfiguration(): any {
        return new WidgetConfiguration(this.widgetId, 'Suchvorlagen', [], {}, true, WidgetSize.SMALL);
    }

}

module.exports = (data, host, options) => {
    return new SearchTemplatesWidgetFactoryExtension();
};
