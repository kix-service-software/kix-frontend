import {
    AbstractMarkoComponent, ActionFactory, ContextService, StandardTableFactoryService
} from '@kix/core/dist/browser';
import { ComponentState } from './ComponentState';
import {
    ConfigItemClass, KIXObjectType, SortUtil, ConfigItemClassDefinitionProperty, DataType, SortOrder
} from '@kix/core/dist/model';
import { ConfigItemClassDetailsContext } from '@kix/core/dist/browser/cmdb';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = await ContextService.getInstance().getContext<ConfigItemClassDetailsContext>(
            ConfigItemClassDetailsContext.CONTEXT_ID
        );

        context.registerListener('config-item-class-versions-widget', {
            sidebarToggled: () => { return; },
            explorerBarToggled: () => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: () => { return; },
            objectChanged: async (ciClassId: string, ciClass: ConfigItemClass, type: KIXObjectType) => {
                if (type === KIXObjectType.CONFIG_ITEM_CLASS) {
                    this.initWidget(ciClass);
                }
            }
        });

        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        await this.initWidget(await context.getObject<ConfigItemClass>());
    }

    private async initWidget(ciClass: ConfigItemClass): Promise<void> {
        this.prepareTable(ciClass);
        this.setActions(ciClass);
    }

    private async prepareTable(ciClass: ConfigItemClass): Promise<void> {
        this.state.table = null;
        if (ciClass && ciClass.Definitions) {
            const table = StandardTableFactoryService.getInstance().createStandardTable(
                KIXObjectType.CONFIG_ITEM_CLASS_DEFINITION
            );

            const definitions = SortUtil.sortObjects(
                ciClass.Definitions, ConfigItemClassDefinitionProperty.CREATE_TIME, DataType.DATE, SortOrder.UP
            );
            table.layerConfiguration.contentLayer.setPreloadedObjects(definitions);
            await table.loadRows();
            this.state.table = table;
        }
    }

    private setActions(ciClass: ConfigItemClass): void {
        if (this.state.widgetConfiguration && ciClass) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [ciClass]
            );
        }
    }

}

module.exports = Component;
