import { ComponentState } from './ComponentState';
import {
    ContextService, ActionFactory, KIXObjectServiceRegistry, StandardTableFactoryService,
    TableConfiguration, TableHeaderHeight, TableRowHeight,
    ObjectLinkDescriptionLabelLayer, TableColumn, WidgetService, IdService
} from '@kix/core/dist/browser';
import { KIXObjectType, Link, KIXObject, DataType, WidgetType, Context, ConfigItem } from '@kix/core/dist/model';

class Component {

    private state: ComponentState;
    private contextListenerId: string;

    public onCreate(): void {
        this.state = new ComponentState();
        this.contextListenerId = IdService.generateDateBasedId('config-item-linked-objects-widget');
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        WidgetService.getInstance().setWidgetType('linked-object-group', WidgetType.GROUP);
        const context = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        context.registerListener(this.contextListenerId, {
            objectChanged: (id: string | number, object: ConfigItem, type: KIXObjectType) => {
                if (type === KIXObjectType.CONFIG_ITEM) {
                    this.initWidget(context, object);
                }
            },
            sidebarToggled: () => { return; },
            explorerBarToggled: () => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: () => { return; }
        });

        await this.initWidget(context, await context.getObject<ConfigItem>());
    }

    private async initWidget(context: Context, configItem?: ConfigItem): Promise<void> {
        this.state.loading = true;
        this.state.configItem = configItem;
        this.setActions();
        await this.setLinkedObjectsGroups();

        setTimeout(() => {
            this.state.loading = false;
        }, 100);
    }

    private setActions(): void {
        if (this.state.widgetConfiguration && this.state.configItem) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, false, [this.state.configItem]
            );
        }
    }

    private async setLinkedObjectsGroups(): Promise<void> {
        this.state.linkedObjectGroups = [];
        if (this.state.widgetConfiguration.settings) {
            const linkedObjectTypes: Array<[string, KIXObjectType]> =
                this.state.widgetConfiguration.settings.linkedObjectTypes;

            const configItemId = this.state.configItem.ObjectId.toString();

            let objectsCount = 0;
            for (const lot of linkedObjectTypes) {
                const objectLinks = this.state.configItem.Links.filter((link) => this.checkLink(link, lot[1]));
                const objectIds = objectLinks.map((ol) => ol.SourceKey === configItemId ? ol.TargetKey : ol.SourceKey);

                const service = KIXObjectServiceRegistry.getInstance().getServiceInstance(lot[1]);
                const objects = objectIds.length ? await service.loadObjects(lot[1], objectIds, null) : [];

                const tableConfiguration = new TableConfiguration(
                    null, 5, null, null, false, false, null, null, TableHeaderHeight.SMALL, TableRowHeight.SMALL
                );

                const table = StandardTableFactoryService.getInstance().createStandardTable<KIXObject>(
                    lot[1], tableConfiguration, null, null, true
                );

                if (table) {
                    table.addAdditionalLayerOnTop(new ObjectLinkDescriptionLabelLayer());

                    table.layerConfiguration.contentLayer.setPreloadedObjects(objects);
                    table.loadRows();

                    table.setColumns([
                        new TableColumn('LinkedAs', DataType.STRING, '', null, true, true, 100, true, false, null)
                    ]);

                    objectsCount += objects.length;
                    const title = `${lot[0]} (${objects.length})`;
                    this.state.linkedObjectGroups.push([title, table]);
                }

            }

            this.state.widgetTitle = `${this.state.widgetConfiguration.title} (${objectsCount})`;
        }

    }

    private checkLink(link: Link, objectType: KIXObjectType): boolean {
        const configItemId = this.state.configItem.ObjectId.toString();
        return (link.SourceObject === objectType && link.SourceKey !== configItemId) ||
            (link.TargetObject === objectType && link.TargetKey !== configItemId);
    }

}

module.exports = Component;
