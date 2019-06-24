import { ComponentState } from './ComponentState';
import { FormInputComponent, TreeNode, ConfigItemClass, ConfigItemProperty } from '../../../../core/model';
import { TranslationService } from '../../../../core/browser/i18n/TranslationService';
import { CMDBService } from '../../../../core/browser/cmdb';

class Component extends FormInputComponent<ConfigItemClass, ComponentState> {

    private configItems: ConfigItemClass[];

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.update();
    }

    public async update(): Promise<void> {
        const placeholderText = this.state.field.placeholder
            ? this.state.field.placeholder
            : this.state.field.required ? this.state.field.label : '';

        this.state.placeholder = await TranslationService.translate(placeholderText);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.state.nodes = await CMDBService.getInstance().getTreeNodes(ConfigItemProperty.CLASS_ID);
        this.setCurrentNode();
    }

    public setCurrentNode(): void {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            this.state.currentNode = this.state.nodes.find((n) => this.state.defaultValue.value.equals(n.id));
            const configItem = this.state.currentNode ? this.configItems.find(
                (cu) => cu.ID === this.state.currentNode.id
            ) : null;
            super.provideValue(configItem);
        }
    }

    public configItemChanged(nodes: TreeNode[]): void {
        this.state.currentNode = nodes && nodes.length ? nodes[0] : null;
        const configItemClass = this.state.currentNode ? this.state.currentNode.id : null;
        super.provideValue(configItemClass);
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }

}

module.exports = Component;
