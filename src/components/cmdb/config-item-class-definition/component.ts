import { AbstractMarkoComponent } from '@kix/core/dist/browser';
import { ComponentState } from './ComponentState';
import { ConfigItemClassDefinition } from '@kix/core/dist/model';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        const code = input.definition ? input.definition.DefinitionString : '';
        this.state.definitionString = '<pre><code class="language-perl">' + code + '</code></pre>';
    }

    public async onMount(): Promise<void> {
        return;
    }

}

module.exports = Component;
