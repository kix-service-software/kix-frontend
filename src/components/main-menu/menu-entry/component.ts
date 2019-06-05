import { ComponentState } from './ComponentState';
import { RoutingConfiguration } from '../../../core/browser/router';
import { ContextMode } from '../../../core/model';
import { AbstractMarkoComponent, ContextService } from '../../../core/browser';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.entry = input.entry;
    }

    public getRoutingConfiguration(): RoutingConfiguration {
        return this.state.entry
            ? new RoutingConfiguration(this.state.entry.mainContextId, null, ContextMode.DASHBOARD, null)
            : null;
    }


}

module.exports = Component;
