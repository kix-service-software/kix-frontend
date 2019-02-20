import {
    AbstractMarkoComponent, ActionFactory, ContextService, WidgetService,
    TableEvent, TableFactoryService, TableEventData
} from '../../../../../core/browser';
import { ComponentState } from './ComponentState';
import { ConfigItemClass, KIXObjectType } from '../../../../../core/model';
import { ConfigItemClassDetailsContext } from '../../../../../core/browser/cmdb';
import { IEventSubscriber, EventService } from '../../../../../core/browser/event';

class Component extends AbstractMarkoComponent<ComponentState> {

    public tableSubscriber: IEventSubscriber;
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
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        context.registerListener('config-item-class-versions-widget', {
            explorerBarToggled: () => { return; },
            filteredObjectListChanged: () => { return; },
            objectListChanged: () => { return; },
            sidebarToggled: () => { return; },
            objectChanged: async (ciClassId: string, ciClass: ConfigItemClass, type: KIXObjectType) => {
                if (type === KIXObjectType.CONFIG_ITEM_CLASS) {
                    this.initWidget(ciClass);
                }
            }
        });

        await this.initWidget(await context.getObject<ConfigItemClass>());
    }

    private async initWidget(ciClass: ConfigItemClass): Promise<void> {
        this.prepareActions(ciClass);
        this.prepareTable();
    }

    public onDestroy(): void {
        WidgetService.getInstance().unregisterActions(this.state.instanceId);
        EventService.getInstance().unsubscribe(TableEvent.TABLE_READY, this.tableSubscriber);
        EventService.getInstance().unsubscribe(TableEvent.TABLE_INITIALIZED, this.tableSubscriber);
    }

    private async prepareTable(): Promise<void> {
        const table = TableFactoryService.getInstance().createTable(
            KIXObjectType.CONFIG_ITEM_CLASS_DEFINITION, null, null, ConfigItemClassDetailsContext.CONTEXT_ID, true
        );

        WidgetService.getInstance().setActionData(this.state.instanceId, table);

        this.tableSubscriber = {
            eventSubscriberId: 'config-item-admin-class-definitions-table-listener',
            eventPublished: (data: TableEventData, eventId: string) => {
                if (data && data.tableId === table.getTableId()) {
                    WidgetService.getInstance().updateActions(this.state.instanceId);
                }
            }
        };

        EventService.getInstance().subscribe(TableEvent.TABLE_READY, this.tableSubscriber);
        EventService.getInstance().subscribe(TableEvent.TABLE_INITIALIZED, this.tableSubscriber);
        this.state.table = table;
    }

    private prepareActions(ciClass: ConfigItemClass): void {
        if (this.state.widgetConfiguration && ciClass) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [ciClass]
            );
        }
        WidgetService.getInstance().registerActions(this.state.instanceId, this.state.actions);
    }

}

module.exports = Component;
