import { SidebarMenuComponentState } from './SidebarMenuComponentState';
import { ContextService } from '@kix/core/dist/browser/context';
import { Context, WidgetType, ConfiguredWidget, ContextType } from '@kix/core/dist/model';

class SidebarMenuComponent {

    private state: SidebarMenuComponentState;

    public onCreate(input: any): void {
        this.state = new SidebarMenuComponentState();
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
                    this.setSidebarMenu(context);
                },
                explorerBarToggled: () => { return; },
                objectChanged: () => { return; }
            });
        }
        this.setSidebarMenu(context);
    }

    private setSidebarMenu(context: Context<any>): void {
        if (context) {
            this.state.sidebars = Array.from(context ? (context.getSidebars() || []) : []);
        }
    }

    private toggleSidebar(instanceId: string): void {
        ContextService.getInstance().getContext(this.state.contextType).toggleSidebar(instanceId);
    }

    private isShown(sidebar: ConfiguredWidget): boolean {
        const context = ContextService.getInstance().getContext(this.state.contextType);
        const sidebars = context.getSidebars(true) || [];
        return (sidebars.findIndex((sb) => sb.instanceId === sidebar.instanceId) !== -1);
    }

}

module.exports = SidebarMenuComponent;
