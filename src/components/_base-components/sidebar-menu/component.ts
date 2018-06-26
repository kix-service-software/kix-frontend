import { SidebarMenuComponentState } from './SidebarMenuComponentState';
import { ContextService } from '@kix/core/dist/browser/context';
import { Context, ConfiguredWidget, ContextType } from '@kix/core/dist/model';
import { IdService } from '@kix/core/dist/browser';

class SidebarMenuComponent {

    private state: SidebarMenuComponentState;
    private contextListernerId: string;

    public onCreate(input: any): void {
        this.state = new SidebarMenuComponentState();
        this.contextListernerId = IdService.generateDateBasedId('sidebar-menu-');
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

        this.setContext(ContextService.getInstance().getActiveContext(this.state.contextType));
    }

    private setContext(context: Context<any>): void {
        if (context) {
            context.registerListener(this.contextListernerId, {
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
        ContextService.getInstance().getActiveContext(this.state.contextType).toggleSidebar(instanceId);
    }

    private isShown(sidebar: ConfiguredWidget): boolean {
        const context = ContextService.getInstance().getActiveContext(this.state.contextType);
        const sidebars = context.getSidebars(true) || [];
        return (sidebars.findIndex((sb) => sb.instanceId === sidebar.instanceId) !== -1);
    }

}

module.exports = SidebarMenuComponent;
