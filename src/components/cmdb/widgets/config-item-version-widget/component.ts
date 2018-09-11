import { ContextService } from '@kix/core/dist/browser/context';
import {
    ConfigItemHistoryTableLabelLayer, ConfigItemHistoryTableContentLayer
} from '@kix/core/dist/browser/cmdb';
import { ComponentState } from './ComponentState';
import { ActionFactory, StandardTableFactoryService, IdService } from '@kix/core/dist/browser';
import { KIXObjectType, ConfigItem } from '@kix/core/dist/model';
import { EventService, IEventListener } from '@kix/core/dist/browser/event';

class Component implements IEventListener {

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
        this.state.title = `${configItem.Name} Versionsdetails (${configItem.Versions.length})`;
        this.setActions();
        this.prepareVersionTable();
    }

    private setActions(): void {
        if (this.state.widgetConfiguration && this.configItem) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, false, [this.configItem]
            );
        }
    }

    private async prepareVersionTable(): Promise<void> {
        if (this.state.widgetConfiguration) {
            const table = StandardTableFactoryService.getInstance().createStandardTable(
                KIXObjectType.CONFIG_ITEM_VERSION, null, null, null, null, true
            );

            table.layerConfiguration.contentLayer.setPreloadedObjects(this.configItem.Versions);
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
                    tableComponent.scrollToObject(data);
                }
            }, 200);
        }
    }

}

module.exports = Component;
