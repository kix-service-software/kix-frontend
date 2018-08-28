import { ComponentState } from "./ComponentState";
import {
    FormInputComponent, TreeNode, ConfigItem
} from "@kix/core/dist/model";
import { FormService } from "@kix/core/dist/browser/form";
import { CMDBService } from "@kix/core/dist/browser/cmdb";

class Component extends FormInputComponent<ConfigItem, ComponentState> {

    private configItems: ConfigItem[];

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public onMount(): void {
        super.onMount();
        this.state.searchCallback = this.searchConfigItems.bind(this);
        const formInstance = FormService.getInstance().getFormInstance(this.state.formId);
        this.state.autoCompleteConfiguration = formInstance.getAutoCompleteConfiguration();
        this.setCurrentNode();
    }

    public setCurrentNode(): void {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            this.state.currentNode = this.state.nodes.find((n) => this.state.defaultValue.value.equals(n.id));
            const configItem = this.state.currentNode ? this.configItems.find(
                (cu) => cu.ConfigItemID === this.state.currentNode.id
            ) : null;
            super.provideValue(configItem);
        }
    }

    public configItemChanged(nodes: TreeNode[]): void {
        this.state.currentNode = nodes && nodes.length ? nodes[0] : null;
        const configItem = this.state.currentNode ? this.state.currentNode.id : null;
        super.provideValue(configItem);
    }

    private async searchConfigItems(limit: number, searchValue: string): Promise<TreeNode[]> {
        this.state.nodes = [];
        const ciCLassOption = this.state.field.options.find((o) => o.option === 'CI_CLASS');
        if (ciCLassOption) {
            const ciClassNames = ciCLassOption.value as string[];

            this.configItems = await CMDBService.getInstance().searchConfigItemsByClass(
                ciClassNames, searchValue, limit
            );

            if (searchValue && searchValue !== '') {
                this.state.nodes = this.configItems.map(
                    (c) => new TreeNode(c, c.Name, 'kix-icon-ci')
                );
            }
        }

        return this.state.nodes;
    }

}

module.exports = Component;
