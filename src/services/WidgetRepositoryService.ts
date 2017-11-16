import { injectable, inject } from 'inversify';

import {
    ContainerConfiguration,
    WidgetDescriptor,
    IPluginService,
    IConfigurationService,
    IWidgetRepositoryService
} from '@kix/core';

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

    /**
     * @description ASYNC - returns all content widget descriptors based on a context
     *
     * @param {string} contexId id of the context (dashboard)
     *
     * @return promise of WidgetDescriptor[]
     */
    public async getContentWidgets(contextId: string): Promise<WidgetDescriptor[]> {
        const allWidgets: WidgetDescriptor[] = await this.getAllWidgets(contextId);
        return allWidgets.filter((wd) => wd.isContentWidget);
    }

    /**
     * @description ASYNC - returns all sidebar widget descriptors based on a context
     *
     * @param {string} contexId id of the context (dashboard)
     *
     * @return promise of WidgetDescriptor[]
     */
    public async getSidebarWidgets(contextId: string): Promise<WidgetDescriptor[]> {
        const allWidgets: WidgetDescriptor[] = await this.getAllWidgets(contextId);
        return allWidgets.filter((wd) => wd.isSidebarWidget);
    }

    /**
     * @description ASYNC - returns all widget descriptors based on a context
     *
     * @param {string} contexId id of the context (dashboard)
     *
     * @return promise of WidgetDescriptor[]
     */
    public async getAllWidgets(contextId: string): Promise<WidgetDescriptor[]> {
        const preDefinedWidgetsConfiguration: any
            = await this.configurationService.getPreDefinedWidgetConfiguration();
        const widgetFactories = await this.pluginService.getWidgetFactories();

        const preDefinedWidgetDescriptors: WidgetDescriptor[] = preDefinedWidgetsConfiguration[contextId] || [];
        const widgetDescriptors = widgetFactories.map((wf) => new WidgetDescriptor(
            wf.widgetId, wf.getDefaultConfiguration(), wf.isContentWidget, wf.isSidebar
        ));
        console.log(widgetDescriptors);

        return [...preDefinedWidgetDescriptors, ...widgetDescriptors];
    }
}
