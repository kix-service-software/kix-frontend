import { ComponentState } from "./ComponentState";
import {
    FormInputComponent, KIXObjectType,
    TreeNode, KIXObjectLoadingOptions, KIXObject
} from "@kix/core/dist/model";
import { FormService } from "@kix/core/dist/browser/form";
import { LabelService, KIXObjectService } from "@kix/core/dist/browser";

class Component extends FormInputComponent<KIXObject, ComponentState> {

    private objects: KIXObject[];

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onInput(input: any): Promise<void> {
        await super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.state.searchCallback = this.search.bind(this);
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        this.state.autoCompleteConfiguration = formInstance.getAutoCompleteConfiguration();
        await this.setCurrentNode();
    }

    public async setCurrentNode(): Promise<void> {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            const object = this.state.defaultValue.value;
            this.state.currentNode = await this.createTreeNode(object);
            this.state.nodes = [this.state.currentNode];
            super.provideValue(object);
        }
    }

    public objectChanged(nodes: TreeNode[]): void {
        this.state.currentNode = nodes && nodes.length ? nodes[0] : null;
        const object = this.state.currentNode ? this.objects.find(
            (cu) => cu.ObjectId === this.state.currentNode.id
        ) : null;
        super.provideValue(object);
    }

    private async search(limit: number, searchValue: string): Promise<TreeNode[]> {
        this.state.nodes = [];
        const option = this.state.field.options.find((o) => o.option === 'OBJECT');
        if (option) {

            const objectType = option.value as KIXObjectType;

            const loadingOptions = new KIXObjectLoadingOptions(null, null, null, searchValue, limit);
            this.objects = await KIXObjectService.loadObjects<KIXObject>(
                objectType, null, loadingOptions, null, false
            );

            if (searchValue && searchValue !== '') {
                this.state.nodes = [];
                for (const o of this.objects) {
                    const node = await this.createTreeNode(o);
                    this.state.nodes.push(node);
                }
            }
        }

        return this.state.nodes;
    }

    private async createTreeNode(o: KIXObject): Promise<TreeNode> {
        const text = await LabelService.getInstance().getText(o);
        const icon = LabelService.getInstance().getIcon(o);
        return new TreeNode(o.ObjectId, text, icon);
    }

}

module.exports = Component;
