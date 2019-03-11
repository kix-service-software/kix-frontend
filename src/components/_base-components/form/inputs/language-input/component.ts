import { FormInputComponent, TreeNode, KIXObjectType } from '../../../../../core/model';
import { CompontentState } from './CompontentState';
import { ServiceRegistry } from '../../../../../core/browser';
import { TranslationService } from '../../../../../core/browser/i18n/TranslationService';

class Component extends FormInputComponent<number, CompontentState> {

    public onCreate(): void {
        this.state = new CompontentState();
    }

    public async onInput(input: any): Promise<void> {
        await super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        const translationService = ServiceRegistry.getServiceInstance<TranslationService>(
            KIXObjectType.TRANSLATION
        );
        const languages = await translationService.getLanguages();
        this.state.nodes = languages.map((l) => new TreeNode(l[0], l[1]));
        this.setCurrentNode();
    }

    public setCurrentNode(): void {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            this.state.currentNode = this.state.nodes.find((n) => n.id === this.state.defaultValue.value);
            super.provideValue(this.state.currentNode ? this.state.currentNode.id : null);
        }
    }

    public valueChanged(nodes: TreeNode[]): void {
        this.state.currentNode = nodes && nodes.length ? nodes[0] : null;
        super.provideValue(this.state.currentNode ? this.state.currentNode.id : null);
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }
}

module.exports = Component;
