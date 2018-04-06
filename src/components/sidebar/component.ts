import { SidebarComponentState } from './SidebarComponentState';
import { ContextService, ContextNotification } from '@kix/core/dist/browser/context';
import { ComponentsService } from '@kix/core/dist/browser/components';
import { WidgetType } from '@kix/core/dist/model';

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
            || type === ContextNotification.CONTEXT_CHANGED
            && id === ContextService.getInstance().getActiveContextId()) {
            this.updateSidebars();
        }
    }

    private updateSidebars(): void {
        const context = ContextService.getInstance().getContext();
        this.state.sidebars = context ? (context.getSidebars(true) || []) : [];
        this.state.showSidebar = context ? context.isSidebarShown() : false;
    }

    private getSidebarTemplate(instanceId: string): any {
        const context = ContextService.getInstance().getContext();
        const config = context ? context.getWidgetConfiguration(instanceId) : undefined;
        return config ? ComponentsService.getInstance().getComponentTemplate(config.widgetId) : undefined;
    }

    private getWidgetType(): WidgetType {
        return WidgetType.SIDEBAR;
    }
}

module.exports = SidebarComponent;
