import { ContextService, ActionFactory, WidgetService } from "@kix/core/dist/browser";
import { ComponentState } from './ComponentState';
import { KIXObjectType, AbstractAction, WidgetType, ConfigItem } from "@kix/core/dist/model";
import { FAQArticle } from "@kix/core/dist/model/kix/faq";
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
        this.state.configuration = context.getConfiguration();
        // this.state.lanes = context.getLanes(true);
        // this.state.tabWidgets = context.getLaneTabs(true);

        setTimeout(() => {
            this.state.loading = false;
        }, 50);
    }

    public getTitle(): string {
        const context = ContextService.getInstance().getActiveContext();
        return context.getDisplayText();
    }

    public getConfigItemActions(): AbstractAction[] {
        const actions = [];
        // const config = this.state.configuration;
        // if (config && this.state.configItem) {
        //     actions =
        //         ActionFactory.getInstance().generateActions(config.configItemActions, true, [this.state.configItem]);
        // }
        return actions;
    }

    public getActions(): AbstractAction[] {
        const actions = [];
        // const config = this.state.configuration;
        // if (config && this.state.configItem) {
        //     actions = ActionFactory.getInstance().generateActions(config.actions, true, [this.state.configItem]);
        // }
        return actions;
    }

    public getWidgetTemplate(instanceId: string): any {
        const context = ContextService.getInstance().getActiveContext();
        const config = context ? context.getWidgetConfiguration(instanceId) : undefined;
        return config ? ComponentsService.getInstance().getComponentTemplate(config.widgetId) : undefined;
    }

}

module.exports = Component;
