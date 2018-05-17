import { SidebarMenuComponentState } from './SidebarMenuComponentState';
import { ContextService, ContextNotification } from '@kix/core/dist/browser/context';
import { Context, WidgetType, ConfiguredWidget } from '@kix/core/dist/model';

class SidebarMenuComponent {

    private state: SidebarMenuComponentState;

    public onCreate(input: any): void {
        this.state = new SidebarMenuComponentState();
    }

    public onMount(): void {
        ContextService.getInstance().addStateListener(this.contextServiceNotified.bind(this));
        this.setSidebarMenu();
    }

    public contextServiceNotified(id: string, type: ContextNotification, ...args): void {
        if (type === ContextNotification.CONTEXT_CONFIGURATION_CHANGED
            || type === ContextNotification.CONTEXT_CHANGED
            || type === ContextNotification.SIDEBAR_BAR_TOGGLED
            && id === ContextService.getInstance().getActiveContextId()
        ) {
            this.setSidebarMenu();
        }
    }

    private setSidebarMenu(): void {
        const context = ContextService.getInstance().getContext();
        this.state.sidebars = Array.from(context ? (context.getSidebars() || []) : []);
    }

    private toggleSidebar(instanceId: string): void {
        ContextService.getInstance().getContext().toggleSidebar(instanceId);
    }

    private isShown(sidebar: ConfiguredWidget): boolean {
        const context = ContextService.getInstance().getContext();
        const sidebars = context.getSidebars(true) || [];
        return (sidebars.findIndex((sb) => sb.instanceId === sidebar.instanceId) !== -1);
    }

}

module.exports = SidebarMenuComponent;
