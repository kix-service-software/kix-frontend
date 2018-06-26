import { ContextService } from '@kix/core/dist/browser/context/';
import { ConfiguredWidget, Context, ContextType } from '@kix/core/dist/model/';
import { ComponentsService } from '@kix/core/dist/browser/components';
import { ComponentState } from './ComponentState';
import { IdService } from '@kix/core/dist/browser';

class Component {

    private state: ComponentState;
    private contextListernerId: string;

    public onCreate(): void {
        this.state = new ComponentState();
        this.contextListernerId = IdService.generateDateBasedId('explorer-');
    }

    public onInput(input: any): void {
        this.state.contextType = input.contextType || 'MAIN';
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
            this.state.isExplorerBarExpanded = context.explorerBarExpanded;
            this.state.explorer = context.getExplorer() || [];
            if (this.state.explorer.length) {
                context.registerListener(this.contextListernerId, {
                    sidebarToggled: () => { return; },
                    explorerBarToggled: () => {
                        this.state.isExplorerBarExpanded = context.explorerBarExpanded;
                    },
                    objectChanged: () => { return; },
                });
            }
            (this as any).setStateDirty('explorer');
        }
    }

    public getExplorerTemplate(widget: ConfiguredWidget): any {
        return ComponentsService.getInstance().getComponentTemplate(widget.configuration.widgetId);
    }

    public isExplorerBarExpanded(instanceId: string): boolean {
        const context = ContextService.getInstance().getActiveContext();
        return context.explorerBarExpanded;
    }

    public toggleExplorerBar(): void {
        ContextService.getInstance().getActiveContext().toggleExplorerBar();
    }
}

module.exports = Component;
