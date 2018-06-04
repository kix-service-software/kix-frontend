import { SidebarComponentState } from './SidebarComponentState';
import { ContextService } from '@kix/core/dist/browser/context';
import { ComponentsService } from '@kix/core/dist/browser/components';
import { WidgetType, Context, ContextType } from '@kix/core/dist/model';

class SidebarComponent {

    private state: SidebarComponentState;

    public onCreate(input: any): void {
        this.state = new SidebarComponentState();
    }

    public onInput(input: any): void {
        this.state.contextType = input.contextType;
    }

    public onMount(): void {
        ContextService.getInstance().registerListener({
            contextChanged: (contextId: string, context: Context<any>, type: ContextType) => {
                if (type === this.state.contextType) {
                    this.setContext(context);
                }
            }
        });
        this.setContext(ContextService.getInstance().getContext(this.state.contextType));
    }

    private setContext(context: Context<any>): void {
        if (context) {
            context.registerListener({
                sidebarToggled: () => {
                    this.updateSidebars(context);
                },
                explorerBarToggled: () => { return; },
                objectChanged: () => { return; },
            });
        }
        this.updateSidebars(context);
    }

    private updateSidebars(context: Context<any>): void {
        this.state.sidebars = context ? (context.getSidebars(true) || []) : [];
        this.state.showSidebar = context ? context.isSidebarShown() : false;
    }

    private getSidebarTemplate(instanceId: string): any {
        const context = ContextService.getInstance().getContext(this.state.contextType);
        const config = context ? context.getWidgetConfiguration(instanceId) : undefined;
        return config ? ComponentsService.getInstance().getComponentTemplate(config.widgetId) : undefined;
    }

    private getWidgetType(): WidgetType {
        return WidgetType.SIDEBAR;
    }
}

module.exports = SidebarComponent;
