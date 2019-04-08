import { FormInputComponent, TreeNode } from "../../../../../core/model";
import { CompontentState } from "./CompontentState";
import { ObjectDataService } from "../../../../../core/browser/ObjectDataService";
import { TranslationService } from "../../../../../core/browser/i18n/TranslationService";

class Component extends FormInputComponent<number, CompontentState> {

    public onCreate(): void {
        this.state = new CompontentState();
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
        const objectData = ObjectDataService.getInstance().getObjectData();
        if (objectData) {

            const nodes = [];

            for (const l of objectData.faqVisibilities) {
                const labelText = await TranslationService.translate(l[1]);
                nodes.push(new TreeNode(l[0], labelText));
            }

            this.state.nodes = nodes;
        }
        this.setCurrentNode();
    }

    public setCurrentNode(): void {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            this.state.currentNode = this.state.nodes.find((n) => n.id === this.state.defaultValue.value);
            super.provideValue(this.state.currentNode ? this.state.currentNode.id : null);
        }
    }

    public validChanged(nodes: TreeNode[]): void {
        this.state.currentNode = nodes && nodes.length ? nodes[0] : null;
        super.provideValue(this.state.currentNode ? this.state.currentNode.id : null);
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }
}

module.exports = Component;
