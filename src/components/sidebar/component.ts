import { SidebarComponentState } from './SidebarComponentState';
import { ContextService, ContextNotification } from '@kix/core/dist/browser/context';

class SidebarComponent {

    private state: SidebarComponentState;

    public onCreate(input: any): void {
        this.state = new SidebarComponentState();
    }

    public onMount(): void {
        ContextService.getInstance().addStateListener(this.contextServiceNotified.bind(this));
        this.updateSidebars();
    }

    public contextServiceNotified(id: string, type: ContextNotification, ...args): void {
        if (type === ContextNotification.SIDEBAR_BAR_TOGGLED
            || type === ContextNotification.CONTEXT_CONFIGURATION_CHANGED
            && id === ContextService.getInstance().getActiveContextId()) {
            this.updateSidebars();
        }
    }

    private updateSidebars(): void {
        const context = ContextService.getInstance().getContext();
        this.state.sidebars = context ? context.getSidebars(true) : [];
        this.state.showSidebar = context ? context.isSidebarShown() : false;
    }

    private getSidebarTemplate(instanceId: string): any {
        const context = ContextService.getInstance().getContext();
        return context ? context.getWidgetTemplate(instanceId) : undefined;
    }
}

module.exports = SidebarComponent;
