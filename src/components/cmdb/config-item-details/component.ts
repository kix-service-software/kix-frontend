import { ContextService, ActionFactory, WidgetService } from "@kix/core/dist/browser";
import { ComponentState } from './ComponentState';
import { KIXObjectType, AbstractAction, WidgetType, ConfigItem } from "@kix/core/dist/model";
import { ComponentsService } from "@kix/core/dist/browser/components";
import { ConfigItemDetailsContext } from "@kix/core/dist/browser/cmdb";

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        const context = (ContextService.getInstance().getActiveContext() as ConfigItemDetailsContext);
        context.registerListener('config-item-details-component', {
            explorerBarToggled: () => { return; },
            filteredObjectListChanged: () => { return; },
            objectListChanged: () => { return; },
            sidebarToggled: () => { return; },
            objectChanged: (configItemId: number, configItem: ConfigItem, type: KIXObjectType) => {
                if (type === KIXObjectType.CONFIG_ITEM) {
                    this.initWidget(context, configItem);
                }
            }
        });

        await this.initWidget(context);
    }

    private async initWidget(context: ConfigItemDetailsContext, configItem?: ConfigItem): Promise<void> {
        this.state.loading = true;
        this.state.configItem = configItem ? configItem : await context.getObject<ConfigItem>();

        if (!this.state.configItem) {
            this.state.error = `Kein Config Item mit ID ${context.getObjectId()} verfügbar.`;
        }

        this.state.configuration = context.getConfiguration();
        this.state.lanes = context.getLanes(true);
        this.state.tabWidgets = context.getLaneTabs(true);
        this.state.contentWidgets = context.getContent(true);

        await this.prepareTitle();
        setTimeout(() => {
            this.state.loading = false;
        }, 50);
    }

    public async prepareTitle(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        this.state.title = await context.getDisplayText();
    }

    public getConfigItemActions(): AbstractAction[] {
        let actions = [];
        const config = this.state.configuration;
        if (config && this.state.configItem) {
            actions =
                ActionFactory.getInstance().generateActions(config.configItemActions, [this.state.configItem]);
        }
        return actions;
    }

    public getActions(): AbstractAction[] {
        let actions = [];
        const config = this.state.configuration;
        if (config && this.state.configItem) {
            actions = ActionFactory.getInstance().generateActions(config.actions, [this.state.configItem]);
        }
        return actions;
    }

    public getWidgetTemplate(instanceId: string): any {
        const context = ContextService.getInstance().getActiveContext();
        const config = context ? context.getWidgetConfiguration(instanceId) : undefined;
        return config ? ComponentsService.getInstance().getComponentTemplate(config.widgetId) : undefined;
    }

}

module.exports = Component;
