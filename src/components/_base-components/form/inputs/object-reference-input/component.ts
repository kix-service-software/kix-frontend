import { ComponentState } from "./ComponentState";
import {
    FormInputComponent, KIXObjectType,
    TreeNode, KIXObjectLoadingOptions, KIXObject, ObjectReferenceOptions
} from "../../../../../core/model";
import { FormService } from "../../../../../core/browser/form";
import { LabelService, KIXObjectService } from "../../../../../core/browser";

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

        await this.prepareNodes();
        await this.setCurrentNode();
    }

    public async setCurrentNode(): Promise<void> {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            const value = this.state.defaultValue.value;
            if (this.state.nodes && this.state.nodes.length) {
                const node = this.state.nodes.find((n) => n.id === value.ObjectId);
                if (node) {
                    this.state.currentNode = await this.createTreeNode(value);
                }
            }

            if (this.state.autocomplete) {
                this.state.currentNode = await this.createTreeNode(value);
                this.state.nodes = [this.state.currentNode];
            }

            super.provideValue(this.state.currentNode.id);
        }
    }

    public objectChanged(nodes: TreeNode[]): void {
        this.state.currentNode = nodes && nodes.length ? nodes[0] : null;
        const object = this.state.currentNode ? this.objects.find(
            (cu) => cu.ObjectId === this.state.currentNode.id
        ) : null;
        super.provideValue(object);
    }

    private async prepareNodes(): Promise<void> {
        const objectOption = this.state.field.options.find((o) => o.option === ObjectReferenceOptions.OBJECT);
        if (objectOption) {
            const autocompleteOption = this.state.field.options.find(
                (o) => o.option === ObjectReferenceOptions.AUTOCOMPLETE
            );
            this.state.autocomplete = typeof autocompleteOption === 'undefined'
                || autocompleteOption === null
                || autocompleteOption.value ? true : false;
            if (!this.state.autocomplete) {
                this.objects = await KIXObjectService.loadObjects(objectOption.value);
                for (const o of this.objects) {
                    const node = await this.createTreeNode(o);
                    this.state.nodes.push(node);
                }
            }
        }
    }

    private async search(limit: number, searchValue: string): Promise<TreeNode[]> {
        this.state.nodes = [];
        const objectOption = this.state.field.options.find((o) => o.option === ObjectReferenceOptions.OBJECT);
        if (objectOption) {
            if (this.state.autocomplete) {
                const objectType = objectOption.value as KIXObjectType;

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
        }

        return this.state.nodes;
    }

    private async createTreeNode(o: KIXObject): Promise<TreeNode> {
        const text = await LabelService.getInstance().getText(o);
        const icon = LabelService.getInstance().getIcon(o);
        return new TreeNode(o.ObjectId, text, icon);
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }

}

module.exports = Component;
