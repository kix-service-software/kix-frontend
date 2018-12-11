import { AbstractMarkoComponent, ActionFactory, ContextService } from '@kix/core/dist/browser';
import { ComponentState } from './ComponentState';
import { ConfigItemClass, KIXObjectType } from '@kix/core/dist/model';
import { ConfigItemClassLabelProvider, ConfigItemClassDetailsContext } from '@kix/core/dist/browser/cmdb';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        this.state.labelProvider = new ConfigItemClassLabelProvider();
        const context = await ContextService.getInstance().getContext<ConfigItemClassDetailsContext>(
            ConfigItemClassDetailsContext.CONTEXT_ID
        );
        context.registerListener('config-item-class-info-widget', {
            sidebarToggled: () => { return; },
            explorerBarToggled: () => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: () => { return; },
            objectChanged: async (ciClassId: string, ciClass: ConfigItemClass, type: KIXObjectType) => {
                if (type === KIXObjectType.CONFIG_ITEM_CLASS) {
                    this.initWidget(ciClass);
                }
            }
        });
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        await this.initWidget(await context.getObject<ConfigItemClass>());
    }

    private async initWidget(ciClass: ConfigItemClass): Promise<void> {
        this.state.ciClass = ciClass;
        this.setActions();
    }

    private setActions(): void {
        if (this.state.widgetConfiguration && this.state.ciClass) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.state.ciClass]
            );
        }
    }

}

module.exports = Component;
