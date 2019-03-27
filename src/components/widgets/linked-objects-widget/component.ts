import { ComponentState } from './ComponentState';
import {
    ContextService, ActionFactory, TableConfiguration, TableHeaderHeight, TableRowHeight,
    WidgetService, TableFactoryService, DefaultColumnConfiguration, TableEventData,
    TableEvent, AbstractMarkoComponent
} from '../../../core/browser';
import { KIXObjectType, Link, KIXObject, WidgetType, ContextType, DataType } from '../../../core/model';
import { LinkUtil } from '../../../core/browser/link';
import { EventService, IEventSubscriber } from '../../../core/browser/event';

class Component extends AbstractMarkoComponent<ComponentState> {

    private tableSubscriber: IEventSubscriber;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        WidgetService.getInstance().setWidgetType('linked-object-group', WidgetType.GROUP);
        const context = ContextService.getInstance().getActiveContext(ContextType.MAIN);
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        context.registerListener('kix-object-linked-objects-widget', {
            objectChanged: (id: string | number, object: KIXObject, type: KIXObjectType) => {
                this.initWidget(object);
            },
            sidebarToggled: () => { return; },
            explorerBarToggled: () => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: () => { return; },
            scrollInformationChanged: () => { return; }
        });

        await this.initWidget(await context.getObject<KIXObject>());
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(TableEvent.TABLE_READY, this.tableSubscriber);
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

            this.state.title = `${this.state.widgetConfiguration.title}`;

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
                    `link-objects-${lot[1]}`, lot[1], tableConfiguration,
                    objects.map((o) => o.ObjectId), null, true, null, true
                );
                table.addColumns([
                    new DefaultColumnConfiguration(
                        'LinkedAs', true, false, true, false, 120, true, true, false, DataType.STRING
                    )
                ]);

                objectsCount += objects.length;
                const title = `${lot[0]} (${objects.length})`;
                this.state.linkedObjectGroups.push([title, table, objects.length, linkDescriptions]);
            }

            this.state.title = `${this.state.widgetConfiguration.title} (${objectsCount})`;
            this.initTableSubscriber();
        }
    }

    private initTableSubscriber(): void {
        this.tableSubscriber = {
            eventSubscriberId: 'linked-objects-widget',
            eventPublished: (data: TableEventData, eventId: string) => {
                const group = data ? this.state.linkedObjectGroups.find(
                    (g) => g[1].getTableId() === data.tableId
                ) : null;
                if (group) {
                    if (eventId === TableEvent.TABLE_READY) {
                        const values = group[3].map((ld) => {
                            const name = ld.linkTypeDescription.asSource
                                ? ld.linkTypeDescription.linkType.SourceName
                                : ld.linkTypeDescription.linkType.TargetName;

                            const value: [any, [string, any]] = [ld.linkableObject, ['LinkedAs', name]];
                            return value;
                        });
                        if (!!values.length) {
                            group[1].setRowObjectValues(values);
                        }
                    }
                }
            }
        };

        EventService.getInstance().subscribe(TableEvent.TABLE_READY, this.tableSubscriber);
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
