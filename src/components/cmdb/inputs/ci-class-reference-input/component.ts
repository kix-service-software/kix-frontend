import { ComponentState } from "./ComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import {
    Contact, FormInputComponent, KIXObjectType, ContextMode,
    TreeNode, KIXObjectLoadingOptions, ConfigItem, FilterCriteria, ConfigItemProperty, FilterDataType, FilterType
} from "@kix/core/dist/model";
import { FormService } from "@kix/core/dist/browser/form";
import { SearchOperator } from "@kix/core/dist/browser";

class Component extends FormInputComponent<number, ComponentState> {

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
            this.state.currentNode = this.state.nodes.find((n) => n.id === this.state.defaultValue.value);
            const configItem = this.state.currentNode ? this.configItems.find(
                (cu) => cu.ConfigItemID === this.state.currentNode.id
            ) : null;
            super.provideValue(configItem.ConfigItemID);
        }
    }

    public configItemChanged(nodes: TreeNode[]): void {
        this.state.currentNode = nodes && nodes.length ? nodes[0] : null;
        const configItem = this.state.currentNode ? this.configItems.find(
            (cu) => cu.ConfigItemID === this.state.currentNode.id
        ) : null;
        super.provideValue(configItem.ConfigItemID);
    }

    private async searchConfigItems(limit: number, searchValue: string): Promise<TreeNode[]> {
        this.state.nodes = [];
        const ciCLassOption = this.state.field.options.find((o) => o.option === 'CI_CLASS');
        if (ciCLassOption) {
            const ciClassId = Number(ciCLassOption.value);

            const loadingOptions = new KIXObjectLoadingOptions(null, [
                new FilterCriteria(
                    ConfigItemProperty.CLASS_ID, SearchOperator.EQUALS,
                    FilterDataType.NUMERIC, FilterType.AND, ciClassId
                ),
                new FilterCriteria(
                    ConfigItemProperty.NUMBER, SearchOperator.CONTAINS,
                    FilterDataType.STRING, FilterType.AND, searchValue
                )
            ], null, null, limit, ['CurrentVersion']);

            this.configItems = await ContextService.getInstance().loadObjects<ConfigItem>(
                KIXObjectType.CONFIG_ITEM, null, loadingOptions
            );

            if (searchValue && searchValue !== '') {
                this.state.nodes = this.configItems.map(
                    (c) => new TreeNode(c.ConfigItemID, c.CurrentVersion.Name, 'kix-icon-ci')
                );
            }
        }

        return this.state.nodes;
    }

}

module.exports = Component;
