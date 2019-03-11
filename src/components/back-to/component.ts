import { ComponentState } from './ComponentState';
import { ContextService, IContextServiceListener } from '../../core/browser';
import { ContextType, Context, ContextConfiguration } from '../../core/model';
import { ContextHistoryEntry } from '../../core/browser/context/ContextHistoryEntry';
import { RoutingConfiguration, RoutingService } from '../../core/browser/router';

class Component implements IContextServiceListener {

    public state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onMount(): void {
        ContextService.getInstance().registerListener(this);

        document.addEventListener('click', (event: any) => {
            if (!this.state.minimized) {
                if (this.state.keepShow) {
                    this.state.keepShow = false;
                } else {
                    this.toggleList();
                }
            }
        }, false);
    }

    public listClicked(): void {
        this.state.keepShow = true;
    }

    private toggleList(): void {
        this.state.keepShow = true;
        this.state.minimized = !this.state.minimized;
    }

    public navigate(entry: ContextHistoryEntry): void {
        this.toggleList();
    }

    public contextChanged(contextId: string, context: Context<ContextConfiguration>, type: ContextType): void {
        this.state.history = ContextService.getInstance().getHistory();
    }

    public getRoutingConfiguration(entry: ContextHistoryEntry): RoutingConfiguration {
        return new RoutingConfiguration(null, entry.contextId, null, entry.descriptor.contextMode, null, true);
    }

}

module.exports = Component;
