import { ComponentState } from './ComponentState';
import {
    ContextService, ActionFactory, TableConfiguration, TableHeaderHeight, TableRowHeight,
    WidgetService, IdService, TableFactoryService
} from '../../../core/browser';
import { KIXObjectType, Link, KIXObject, WidgetType, ContextType } from '../../../core/model';
import { LinkUtil } from '../../../core/browser/link';

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
        const context = ContextService.getInstance().getActiveContext(ContextType.MAIN);
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        context.registerListener(this.contextListenerId, {
            objectChanged: (id: string | number, object: KIXObject, type: KIXObjectType) => {
                this.initWidget(object);
            },
            sidebarToggled: () => { return; },
            explorerBarToggled: () => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: () => { return; }
        });

        await this.initWidget(await context.getObject<KIXObject>());
    }

    private async initWidget(kixObject?: KIXObject): Promise<void> {
        this.state.kixObject = kixObject;
        this.setActions();
        await this.prepareLinkedObjectsGroups();
    }

    private setActions(): void {
        if (this.state.widgetConfiguration && this.state.kixObject) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.state.kixObject]
            );
        }
    }

    private async prepareLinkedObjectsGroups(): Promise<void> {
        this.state.linkedObjectGroups = [];
        if (this.state.widgetConfiguration.settings) {
            const linkedObjectTypes: Array<[string, KIXObjectType]> =
                this.state.widgetConfiguration.settings.linkedObjectTypes;

            let objectsCount = 0;
            for (const lot of linkedObjectTypes) {
                const objectLinks = this.state.kixObject.Links.filter((link) => this.checkLink(link, lot[1]));

                const linkDescriptions = await LinkUtil.getLinkDescriptions(this.state.kixObject, objectLinks);

                const tableConfiguration = new TableConfiguration(
                    null, null, null, null, null, false, false, null, null,
                    TableHeaderHeight.SMALL, TableRowHeight.SMALL
                );

                const objects = linkDescriptions.map((ld) => ld.linkableObject);
                const table = TableFactoryService.getInstance().createTable(
                    lot[1], tableConfiguration, objects.map((o) => o.ObjectId), null, true, null, true
                );

                objectsCount += objects.length;
                const title = `${lot[0]} (${objects.length})`;
                this.state.linkedObjectGroups.push([title, table, objects.length]);
                // table.setColumns([
                //     new TableColumn(
                //         'LinkedAs', DataType.STRING, '', null, true, true, 120, true, true, true, false, null
                //     )
                // ]);
            }

            this.state.title = `${this.state.widgetConfiguration.title} (${objectsCount})`;
        }
    }

    public setGroupMinimizedStates(): void {
        setTimeout(() => {
            this.state.linkedObjectGroups.forEach((log, index) => {
                const widgetComponent = (this as any).getComponent('linked-object-group-' + index);
                if (widgetComponent && !log[2]) {
                    widgetComponent.setMinizedState(true);
                }
            });
        }, 100);
    }

    private checkLink(link: Link, objectType: KIXObjectType): boolean {
        const objectId = this.state.kixObject.ObjectId.toString();
        return (link.SourceObject === objectType && link.SourceKey !== objectId) ||
            (link.TargetObject === objectType && link.TargetKey !== objectId);
    }

}

module.exports = Component;
