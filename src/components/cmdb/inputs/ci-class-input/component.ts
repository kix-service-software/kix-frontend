import { ComponentState } from './ComponentState';
import { FormInputComponent, TreeNode, ConfigItemClass, KIXObjectType, ObjectIcon } from '../../../../core/model';
import { KIXObjectService } from '../../../../core/browser';
import { TranslationService } from '../../../../core/browser/i18n/TranslationService';

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

        const classes = await KIXObjectService.loadObjects<ConfigItemClass>(
            KIXObjectType.CONFIG_ITEM_CLASS, null, null, null, false
        );

        this.state.nodes = classes.map(
            (c) => new TreeNode(c, c.Name, new ObjectIcon(KIXObjectType.CONFIG_ITEM_CLASS, c.ID))
        );

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
