import { AbstractMarkoComponent } from '../../../core/browser';
import { ComponentState } from './ComponentState';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        const code = input.definition ? input.definition.DefinitionString : '';
        this.state.definitionString = code;
    }

    public async onMount(): Promise<void> {
        return;
    }

}

module.exports = Component;
