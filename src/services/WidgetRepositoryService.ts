import { injectable, inject } from 'inversify';

import { WidgetDescriptor, WidgetType } from '@kix/core/dist/model';
import {
    IPluginService,
    IConfigurationService,
    IWidgetRepositoryService
} from '@kix/core/dist/services';

@injectable()
export class WidgetRepositoryService implements IWidgetRepositoryService {

    private configurationService: IConfigurationService;
    private pluginService: IPluginService;

    public constructor(
        @inject("IConfigurationService") configurationService: IConfigurationService,
        @inject("IPluginService") pluginService: IPluginService
    ) {
        this.configurationService = configurationService;
        this.pluginService = pluginService;
    }

    public async getAvailableWidgets<T>(
        contextId: string, widgetType?: WidgetType
    ): Promise<Array<WidgetDescriptor<T>>> {

        const preDefinedWidgetDescriptors
            = await this.configurationService.getPreDefinedWidgetConfiguration(contextId);
        const widgetFactories = await this.pluginService.getWidgetFactories();

        const widgetDescriptors = widgetFactories.map((wf) => new WidgetDescriptor(
            wf.widgetId, wf.getDefaultConfiguration(), wf.type
        ));

        let widgets = [...preDefinedWidgetDescriptors, ...widgetDescriptors];
        if (widgetType) {
            widgets = widgets.filter((wd) => (wd.type & widgetType) === widgetType);
        }

        return widgets;
    }
}
