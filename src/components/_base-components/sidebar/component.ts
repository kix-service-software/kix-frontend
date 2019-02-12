import { ComponentState } from './ComponentState';
import { ContextService } from '../../../core/browser/context';
import { ComponentsService } from '../../../core/browser/components';
import { Context, ContextType } from '../../../core/model';
import { IdService } from '../../../core/browser';

class Component {

    private state: ComponentState;
    private contextListernerId: string;

    public onCreate(input: any): void {
        this.state = new ComponentState();
        this.contextListernerId = IdService.generateDateBasedId('sidebar-');
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
                    this.updateSidebars(context);
                },
                explorerBarToggled: () => { return; },
                objectChanged: () => { return; },
                objectListChanged: () => { return; },
                filteredObjectListChanged: () => { return; }
            });
        }
        this.updateSidebars(context);
    }

    private updateSidebars(context: Context<any>): void {
        this.state.loading = true;
        this.state.sidebars = null;

        setTimeout(() => {
            this.state.sidebars = context ? (context.getSidebars(true) || []) : [];
            this.state.showSidebar = context ? context.isSidebarShown() : false;
            this.state.loading = false;
        }, 100);
    }

    public getSidebarTemplate(instanceId: string): any {
        const context = ContextService.getInstance().getActiveContext(this.state.contextType);
        const config = context ? context.getWidgetConfiguration(instanceId) : undefined;
        return config ? ComponentsService.getInstance().getComponentTemplate(config.widgetId) : undefined;
    }
}

module.exports = Component;
