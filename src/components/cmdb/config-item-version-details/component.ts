import { ComponentState } from './ComponentState';
import { Version } from '@kix/core/dist/model';
import { ConfigItemVersionTreeFactory } from '@kix/core/dist/browser/cmdb';

class Component {

    private state: ComponentState;
    private version: Version;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.version = input.version;
    }

    public async onMount(): Promise<void> {
        if (this.version) {
            this.state.nodes = await ConfigItemVersionTreeFactory.createVersionTree(this.version);
        }
    }

}

module.exports = Component;
