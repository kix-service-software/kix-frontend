import { ContextService } from '../../../../core/browser/context';
import { ComponentState } from './ComponentState';
import { ActionFactory, TableFactoryService } from '../../../../core/browser';
import { KIXObjectType, ConfigItem } from '../../../../core/model';
import { ConfigItemDetailsContext } from '../../../../core/browser/cmdb';


class Component {

    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = await ContextService.getInstance().getContext<ConfigItemDetailsContext>(
            ConfigItemDetailsContext.CONTEXT_ID
        );
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        context.registerListener('config-item-history-widget', {
            explorerBarToggled: () => { return; },
            filteredObjectListChanged: () => { return; },
            objectListChanged: () => { return; },
            sidebarToggled: () => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: (configItemId: string, configItem: ConfigItem, type: KIXObjectType) => {
                if (type === KIXObjectType.CONFIG_ITEM) {
                    this.initWidget(configItem);
                }
            }
        });

        await this.initWidget(await context.getObject<ConfigItem>());
    }

    private async initWidget(configItem: ConfigItem): Promise<void> {
        if (configItem) {
            this.setActions(configItem);
            await this.prepareTable();
        }
    }

    private setActions(configItem: ConfigItem): void {
        if (this.state.widgetConfiguration && configItem) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [configItem]
            );
        }
    }

    private async prepareTable(): Promise<void> {
        const table = TableFactoryService.getInstance().createTable(
            'config-item-history', KIXObjectType.CONFIG_ITEM_HISTORY, null, null, ConfigItemDetailsContext.CONTEXT_ID
        );

        this.state.table = table;
    }

    public filter(filterValue: string): void {
        this.state.table.setFilter(filterValue);
        this.state.table.filter();
    }

    // private navigateToVersion(historyEntry: ConfigItemHistory, columnId: string): void {
    //     if (columnId === 'Content' && historyEntry.VersionID) {
    //         EventService.getInstance().publish('GotToConfigItemVersion', historyEntry.VersionID);
    //     }
    // }

}

module.exports = Component;
