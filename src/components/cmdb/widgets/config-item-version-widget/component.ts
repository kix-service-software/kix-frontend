import { ContextService } from '../../../../core/browser/context';
import { ComponentState } from './ComponentState';
import {
    ActionFactory, StandardTableFactoryService, IdService, WidgetService, TableConfiguration
} from '../../../../core/browser';
import { KIXObjectType, ConfigItem } from '../../../../core/model';
import { EventService, IEventSubscriber } from '../../../../core/browser/event';

class Component implements IEventSubscriber {

    public eventSubscriberId: string = IdService.generateDateBasedId('config-item-version-widget');

    private state: ComponentState;

    private configItem: ConfigItem;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        context.registerListener('config-item-history-widget', {
            explorerBarToggled: () => { return; },
            filteredObjectListChanged: () => { return; },
            objectListChanged: () => { return; },
            sidebarToggled: () => { return; },
            objectChanged: (configItemId: string, configItem: ConfigItem, type: KIXObjectType) => {
                if (type === KIXObjectType.CONFIG_ITEM) {
                    this.initWidget(configItem);
                }
            }
        });

        EventService.getInstance().subscribe('GotToConfigItemVersion', this);

        await this.initWidget(await context.getObject<ConfigItem>());
    }

    private async initWidget(configItem: ConfigItem): Promise<void> {
        this.configItem = configItem;
        this.state.title = `Übersicht Versionsdetails (${configItem.Versions.length})`;
        this.prepareActions();
        this.prepareVersionTable();
    }

    public onDestroy(): void {
        WidgetService.getInstance().unregisterActions(this.state.instanceId);
    }

    private prepareActions(): void {
        if (this.state.widgetConfiguration && this.configItem) {
            this.state.generalVersionActions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.configItem]
            );

            WidgetService.getInstance().registerActions(this.state.instanceId, this.state.generalVersionActions);
        }
    }

    private async prepareVersionTable(): Promise<void> {
        if (this.state.widgetConfiguration) {
            const table = StandardTableFactoryService.getInstance().createStandardTable(
                KIXObjectType.CONFIG_ITEM_VERSION,
                new TableConfiguration(null, this.configItem.Versions.length), null, null, null, true
            );

            this.configItem.Versions.forEach((v, index) => v.countNumber = index + 1);

            table.layerConfiguration.contentLayer.setPreloadedObjects(this.configItem.Versions.reverse());
            await table.loadRows();
            this.state.table = table;
        }
    }

    public eventPublished(data: any, eventId: string): void {
        const widgetComponent = (this as any).getComponent('ci-version-widget');
        if (widgetComponent) {
            widgetComponent.state.minimized = false;
        }
        if (eventId === 'GotToConfigItemVersion') {
            setTimeout(() => {
                const tableComponent = (this as any).getComponent('ci-version-table');
                if (tableComponent) {
                    tableComponent.scrollToObject(data, true);
                }
            }, 200);
        }
    }

}

module.exports = Component;
