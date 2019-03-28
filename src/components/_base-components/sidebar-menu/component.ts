import { ComponentState } from './SidebarMenuComponentState';
import { ContextService } from '../../../core/browser/context';
import { Context, ConfiguredWidget, ContextType } from '../../../core/model';
import { IdService } from '../../../core/browser';
import { TranslationService } from '../../../core/browser/i18n/TranslationService';

class SidebarMenuComponent {

    private state: ComponentState;
    private contextListernerId: string;

    public onCreate(input: any): void {
        this.state = new ComponentState();
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
                objectChanged: () => { return; },
                objectListChanged: () => { return; },
                filteredObjectListChanged: () => { return; },
                scrollInformationChanged: () => { return; }
            });
        }
        this.setSidebarMenu(context);
    }

    private async setSidebarMenu(context: Context<any>): Promise<void> {
        if (context) {
            this.state.sidebars = Array.from(context ? (context.getSidebars() || []) : []);

            this.state.translations = await TranslationService.createTranslationObject(
                this.state.sidebars.map((s) => s.configuration.title)
            );
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
