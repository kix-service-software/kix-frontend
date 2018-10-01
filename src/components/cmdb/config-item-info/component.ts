import { ComponentState } from './ComponentState';
import { ConfigItemLabelProvider } from '@kix/core/dist/browser/cmdb';

class Component {

    private state: ComponentState;

    public labelProvider: ConfigItemLabelProvider;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.configItem = input.configItem;
    }

    public async onMount(): Promise<void> {
        this.labelProvider = new ConfigItemLabelProvider();
        this.state.icon = await this.labelProvider.getIcon(this.state.configItem, "CurInciStateID");
        this.state.loading = false;
    }

}

module.exports = Component;
