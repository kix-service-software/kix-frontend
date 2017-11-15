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
     * ASYNC - returns all content widget descriptors
     *
     * @param contexId id of the context (dashboard)
     *
     * @return promise of WidgetDescriptor[]
     */
    public async getContentWidgets(contextId: string): Promise<WidgetDescriptor[]> {
        const allWidgets: WidgetDescriptor[] = await this.getAllWidgets(contextId);
        const contentWidgets: WidgetDescriptor[] = [];
        allWidgets.forEach((widgetDesc) => {
            if (widgetDesc.isContentWidget) {
                contentWidgets.push(widgetDesc);
            }
        });
        return contentWidgets;
    }

    /**
     * ASYNC - returns all sidebar widget descriptors
     *
     * @param contexId id of the context (dashboard)
     *
     * @return promise of WidgetDescriptor[]
     */
    public async getSidebarWidgets(contextId: string): Promise<WidgetDescriptor[]> {
        const allWidgets: WidgetDescriptor[] = await this.getAllWidgets(contextId);
        const sidebarWidgets: WidgetDescriptor[] = [];
        allWidgets.forEach((widgetDesc) => {
            if (widgetDesc.isSidebarWidget) {
                sidebarWidgets.push(widgetDesc);
            }
        });
        return sidebarWidgets;
    }

    /**
     * ASYNC - returns all widget descriptors
     *
     * @param contexId id of the context (dashboard)
     *
     * @return promise of WidgetDescriptor[]
     */
    private async getAllWidgets(contextId: string): Promise<WidgetDescriptor[]> {
        // TODO: auslesen und ggf. aufbereiten
        const preDefinedWidgets: ContainerConfiguration = await this.configurationService
            .getComponentConfiguration('pre-defined-widgets', contextId, null, null);
        const widgetFactories = await this.pluginService.getWidgetFactories();

        const widgetDescriptors: WidgetDescriptor[] = [];

        widgetFactories.forEach((element) => {
            if (element.isContentWidget) {
                widgetDescriptors.push(new WidgetDescriptor(
                    element.widgetId, element.getDefaultConfiguration(),
                    element.isContentWidget, element.isSidebar
                ));
            }
        });

        return widgetDescriptors;
    }
}
