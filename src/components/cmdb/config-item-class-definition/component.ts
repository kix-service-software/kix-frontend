import { AbstractMarkoComponent } from '../../../core/browser';
import { ComponentState } from './ComponentState';
import { ConfigItemClassDefinition } from '../../../core/model';

class Component extends AbstractMarkoComponent<ComponentState> {

    private definition: ConfigItemClassDefinition;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.definition = input.definition;

    }

    public async onMount(): Promise<void> {
        this.state.definitionString = this.definition ? this.definition.DefinitionString : '';
    }

}

module.exports = Component;
