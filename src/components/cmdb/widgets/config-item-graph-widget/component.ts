import { ComponentState } from './ComponentState';
import {
    ContextService, ActionFactory, IdService, DialogService
} from '@kix/core/dist/browser';
import {
    KIXObjectType, Context, ConfigItem
} from '@kix/core/dist/model';
import { DisplayImageDescription } from '@kix/core/dist/browser/components';

class Component {

    private state: ComponentState;
    private contextListenerId: string;

    public onCreate(): void {
        this.state = new ComponentState();
        this.contextListenerId = IdService.generateDateBasedId('config-item-linked-objects-widget');
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        context.registerListener(this.contextListenerId, {
            objectChanged: (id: string | number, object: ConfigItem, type: KIXObjectType) => {
                if (type === KIXObjectType.CONFIG_ITEM) {
                    this.initWidget(context, object);
                }
            },
            sidebarToggled: () => { return; },
            explorerBarToggled: () => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: () => { return; }
        });

        await this.initWidget(context, await context.getObject<ConfigItem>());
    }

    private async initWidget(context: Context, configItem?: ConfigItem): Promise<void> {
        this.state.loading = true;
        this.state.configItem = configItem;
        this.state.widgetTitle = `${this.state.widgetConfiguration.title}`;
        this.setActions();

        setTimeout(() => {
            this.state.loading = false;
        }, 100);
    }

    private setActions(): void {
        if (this.state.widgetConfiguration && this.state.configItem) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, false, [this.state.configItem]
            );
        }
    }

    public openImageDialog(): void {
        DialogService.getInstance().openImageDialog([this.state.fakeGraphBig]);
    }
}

module.exports = Component;
