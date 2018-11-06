import { ContextService } from '@kix/core/dist/browser/context';
import {
    ConfigItemHistoryTableLabelLayer, ConfigItemHistoryTableContentLayer
} from '@kix/core/dist/browser/cmdb';
import { ComponentState } from './ComponentState';
import {
    StandardTable, ITableConfigurationListener, TableColumn,
    ActionFactory, TableLayerConfiguration, TableListenerConfiguration, ITableClickListener,
} from '@kix/core/dist/browser';
import { KIXObjectType, ConfigItem, ConfigItemHistory } from '@kix/core/dist/model';
import { IdService } from '@kix/core/dist/browser/IdService';
import { EventService } from '@kix/core/dist/browser/event';

class Component {

    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
        this.state.configItemId = Number(input.configItemId);
        this.setHistoryTableConfiguration();
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

        await this.initWidget(await context.getObject<ConfigItem>());
    }

    private async initWidget(configItem: ConfigItem): Promise<void> {
        this.state.configItem = configItem;
        this.setActions();
        this.setHistoryTableConfiguration();
    }

    private setActions(): void {
        if (this.state.widgetConfiguration && this.state.configItem) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.state.configItem]
            );
        }
    }

    private setHistoryTableConfiguration(): void {
        if (this.state.widgetConfiguration) {
            const contentLayer = new ConfigItemHistoryTableContentLayer(this.state.configItem);
            const labelLayer = new ConfigItemHistoryTableLabelLayer();
            const layerConfiguration = new TableLayerConfiguration(contentLayer, labelLayer);

            const configurationListener: ITableConfigurationListener = {
                columnConfigurationChanged: this.columnConfigurationChanged.bind(this)
            };

            const clickListener: ITableClickListener = {
                rowClicked: this.navigateToVersion.bind(this)
            };

            const listenerConfiguration = new TableListenerConfiguration(clickListener, null, configurationListener);

            this.state.standardTable = new StandardTable(
                IdService.generateDateBasedId(),
                this.state.widgetConfiguration.settings, layerConfiguration, listenerConfiguration
            );
        }
    }

    private navigateToVersion(historyEntry: ConfigItemHistory, columnId: string): void {
        if (columnId === 'Content' && historyEntry.VersionID) {
            EventService.getInstance().publish('GotToConfigItemVersion', historyEntry.VersionID);
        }
    }

    private columnConfigurationChanged(column: TableColumn): void {
        const index =
            this.state.widgetConfiguration.settings.tableColumns.findIndex((tc) => tc.columnId === column.id);

        if (index >= 0) {
            this.state.widgetConfiguration.settings.tableColumns[index].size = column.size;
        }

        ContextService.getInstance().saveWidgetConfiguration(this.state.instanceId, this.state.widgetConfiguration);
    }

    private filter(filterValue: string): void {
        this.state.filterValue = filterValue;
        this.state.standardTable.setFilterSettings(filterValue);
    }

}

module.exports = Component;
