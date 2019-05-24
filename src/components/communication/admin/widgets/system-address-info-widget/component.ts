import { AbstractMarkoComponent, ActionFactory, ContextService } from '../../../../../core/browser';
import { ComponentState } from './ComponentState';
import { SystemAddressLabelProvider, SystemAddressDetailsContext } from '../../../../../core/browser/system-address';
import { SystemAddress, KIXObjectType } from '../../../../../core/model';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        this.state.labelProvider = new SystemAddressLabelProvider();
        const context = await ContextService.getInstance().getContext<SystemAddressDetailsContext>(
            SystemAddressDetailsContext.CONTEXT_ID
        );
        context.registerListener('system-address-info-widget', {
            sidebarToggled: () => { return; },
            explorerBarToggled: () => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: () => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: async (ticketId: string, systemAddress: SystemAddress, type: KIXObjectType) => {
                if (type === KIXObjectType.SYSTEM_ADDRESS) {
                    this.initWidget(systemAddress);
                }
            }
        });
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        await this.initWidget(await context.getObject<SystemAddress>());
    }

    private async initWidget(systemAddress: SystemAddress): Promise<void> {
        this.state.systemAddress = systemAddress;
        this.prepareActions();
    }

    private async prepareActions(): Promise<void> {
        if (this.state.widgetConfiguration && this.state.systemAddress) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.state.systemAddress]
            );
        }
    }

}

module.exports = Component;
