import { ComponentState } from './ComponentState';
import {
    ContextService, ActionFactory, StandardTableFactoryService,
    TableConfiguration, TableHeaderHeight, TableRowHeight,
    ObjectLinkDescriptionLabelLayer, TableColumn, WidgetService, IdService
} from '@kix/core/dist/browser';
import {
    KIXObjectType, Link, KIXObject, DataType, WidgetType, Context
} from '@kix/core/dist/model';
import { LinkUtil } from '@kix/core/dist/browser/link';

class Component {

    private state: ComponentState;
    private contextListenerId: string;

    public onCreate(): void {
        this.state = new ComponentState();
        this.contextListenerId = IdService.generateDateBasedId('kix-object-linked-objects-widget');
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        WidgetService.getInstance().setWidgetType('linked-object-group', WidgetType.GROUP);
        const context = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        context.registerListener(this.contextListenerId, {
            objectChanged: (id: string | number, object: KIXObject, type: KIXObjectType) => {
                this.initWidget(context, object);
            },
            sidebarToggled: () => { return; },
            explorerBarToggled: () => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: () => { return; }
        });

        await this.initWidget(context, await context.getObject<KIXObject>());
    }

    private async initWidget(context: Context, kixObject?: KIXObject): Promise<void> {
        this.state.loading = true;
        this.state.kixObject = kixObject;
        this.setActions();
        await this.setLinkedObjectsGroups();

        setTimeout(() => {
            this.state.loading = false;
        }, 100);
    }

    private setActions(): void {
        if (this.state.widgetConfiguration && this.state.kixObject) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, false, [this.state.kixObject]
            );
        }
    }

    private async setLinkedObjectsGroups(): Promise<void> {
        this.state.linkedObjectGroups = [];
        if (this.state.widgetConfiguration.settings) {
            const linkedObjectTypes: Array<[string, KIXObjectType]> =
                this.state.widgetConfiguration.settings.linkedObjectTypes;

            this.state.widgetTitle = `${this.state.widgetConfiguration.title}`;
            let objectsCount = 0;
            for (const lot of linkedObjectTypes) {
                const objectLinks = this.state.kixObject.Links.filter((link) => this.checkLink(link, lot[1]));

                const linkDescriptions = await LinkUtil.getLinkDescriptions(this.state.kixObject, objectLinks);

                const tableConfiguration = new TableConfiguration(
                    null, 5, null, null, false, false, null, null, TableHeaderHeight.SMALL, TableRowHeight.SMALL
                );

                const table = StandardTableFactoryService.getInstance().createStandardTable<KIXObject>(
                    lot[1], tableConfiguration, null, null, true
                );

                if (table) {
                    const objectLinkLayer = new ObjectLinkDescriptionLabelLayer();
                    objectLinkLayer.setLinkDescriptions(linkDescriptions);
                    table.addAdditionalLayerOnTop(objectLinkLayer);

                    const objects = linkDescriptions.map((ld) => ld.linkableObject);
                    table.layerConfiguration.contentLayer.setPreloadedObjects(objects);

                    table.setColumns([
                        new TableColumn(
                            'LinkedAs', DataType.STRING, '', null, true, true, 100, true, true, true, false, false, null
                        )
                    ]);
                    table.loadRows();

                    objectsCount += objects.length;
                    const title = `${lot[0]} (${objects.length})`;
                    this.state.linkedObjectGroups.push([title, table, objects.length]);
                }

            }

            this.state.widgetTitle = `${this.state.widgetConfiguration.title} (${objectsCount})`;
        }
    }

    // FIXME: nur vorhanden, um eventl. Marko-Bug zu umgehen (hochzählen eines Indexes für Components)
    private componentIndex: number = 0;
    public setGroupMinimizedStates(): void {
        setTimeout(() => {
            this.state.linkedObjectGroups.forEach((log, index) => {
                const widgetComponent = (this as any).getComponent('linked-object-group-' + index, this.componentIndex);
                if (widgetComponent && !log[2] && !widgetComponent.state.minimized) {
                    widgetComponent.state.minimized = true;
                }
            });
            this.componentIndex = this.componentIndex ? this.componentIndex + 1 : 1;
        }, 100);
    }

    private checkLink(link: Link, objectType: KIXObjectType): boolean {
        const objectId = this.state.kixObject.ObjectId.toString();
        return (link.SourceObject === objectType && link.SourceKey !== objectId) ||
            (link.TargetObject === objectType && link.TargetKey !== objectId);
    }

}

module.exports = Component;
