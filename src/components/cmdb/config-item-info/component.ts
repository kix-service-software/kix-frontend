import { ComponentState } from './ComponentState';
import { ConfigItemLabelProvider } from '../../../core/browser/cmdb';

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
        const icons = await this.labelProvider.getIcons(this.state.configItem, "CurInciStateID");
        this.state.icon = icons && icons.length ? icons[0] : null;
        this.state.loading = false;
    }

}

module.exports = Component;
