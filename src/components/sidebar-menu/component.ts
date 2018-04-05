import { SidebarMenuComponentState } from './SidebarMenuComponentState';
import { ContextService, ContextNotification } from '@kix/core/dist/browser/context';
import { Context, WidgetType } from '@kix/core/dist/model';

class SidebarMenuComponent {

    private state: SidebarMenuComponentState;

    public onCreate(input: any): void {
        this.state = new SidebarMenuComponentState();
    }

    public onMount(): void {
        ContextService.getInstance().addStateListener(this.contextServiceNotified.bind(this));
    }

    public contextServiceNotified(id: string, type: ContextNotification, ...args): void {
        if (type === ContextNotification.CONTEXT_CONFIGURATION_CHANGED
            || type === ContextNotification.SIDEBAR_BAR_TOGGLED
            && id === ContextService.getInstance().getActiveContextId()
        ) {
            const context = ContextService.getInstance().getContext();
            this.state.sidebars = context ? context.getSidebars() : [];
        }
    }

    private toggleSidebar(instanceId: string): void {
        ContextService.getInstance().getContext().toggleSidebar(instanceId);
    }

}

module.exports = SidebarMenuComponent;
