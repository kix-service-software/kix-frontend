import { ComponentState } from "./ComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import {
    FormInputComponent, KIXObjectType,
    TreeNode, KIXObjectLoadingOptions, KIXObject
} from "@kix/core/dist/model";
import { FormService } from "@kix/core/dist/browser/form";
import { LabelService } from "@kix/core/dist/browser";

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
        this.setCurrentNode();
    }

    public setCurrentNode(): void {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            this.state.currentNode = this.state.nodes.find((n) => n.id === this.state.defaultValue.value);
            const object = this.state.currentNode ? this.objects.find(
                (cu) => cu.ObjectId === this.state.currentNode.id
            ) : null;
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
            this.objects = await ContextService.getInstance().loadObjects<KIXObject>(
                objectType, null, loadingOptions
            );

            if (searchValue && searchValue !== '') {
                this.state.nodes = this.objects.map(
                    (o) => new TreeNode(
                        o.ObjectId,
                        LabelService.getInstance().getText(o),
                        LabelService.getInstance().getIcon(o)
                    )
                );
            }
        }

        return this.state.nodes;
    }

}

module.exports = Component;
