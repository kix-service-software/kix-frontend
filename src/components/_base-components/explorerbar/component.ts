import { ContextService } from '../../../core/browser/context/';
import { ConfiguredWidget, Context, ContextType } from '../../../core/model/';
import { ComponentState } from './ComponentState';
import { IdService } from '../../../core/browser';
import { KIXModulesService } from '../../../core/browser/modules';

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
            contextChanged: (contextId: string, context: Context, type: ContextType) => {
                if (type === this.state.contextType) {
                    this.setContext(context);
                }
            },
            contextRegistered: () => { return; }
        });
        this.setContext(ContextService.getInstance().getActiveContext(this.state.contextType));
    }

    private setContext(context: Context): void {
        if (context) {
            this.state.isExplorerBarExpanded = context.explorerBarExpanded;
            this.state.explorer = context.getExplorer() || [];
            if (this.state.explorer.length) {
                context.registerListener(this.contextListernerId, {
                    sidebarToggled: () => { return; },
                    explorerBarToggled: () => {
                        const activeContext = ContextService.getInstance().getActiveContext();
                        const structur = activeContext.getAdditionalInformation('STRUCTURE');
                        const explorerStructur = structur ? [...structur] : [];
                        if (explorerStructur && !!explorerStructur.length) {
                            this.state.explorerStructurStringLastElement = explorerStructur.pop();
                            this.state.explorerStructurString = !!explorerStructur.length ?
                                explorerStructur.join(' | ') + ' | ' : '';
                        }
                        this.state.isExplorerBarExpanded = context.explorerBarExpanded;
                    },
                    objectChanged: () => { return; },
                    objectListChanged: () => { return; },
                    filteredObjectListChanged: () => { return; },
                    scrollInformationChanged: () => { return; }
                });
            }
            (this as any).setStateDirty('explorer');
        }
    }

    public getExplorerTemplate(widget: ConfiguredWidget): any {
        return KIXModulesService.getComponentTemplate(widget.configuration.widgetId);
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
