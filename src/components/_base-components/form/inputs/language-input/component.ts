import { FormInputComponent, TreeNode, KIXObjectType } from '../../../../../core/model';
import { CompontentState } from './CompontentState';
import { ServiceRegistry } from '../../../../../core/browser';
import { TranslationService } from '../../../../../core/browser/i18n/TranslationService';

class Component extends FormInputComponent<string, CompontentState> {

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
        const translationService = ServiceRegistry.getServiceInstance<TranslationService>(
            KIXObjectType.TRANSLATION
        );
        const languages = await translationService.getLanguages();
        this.state.nodes = languages.map((l) => new TreeNode(l[0], l[1]));
        await this.setCurrentNode();
    }

    public async setCurrentNode(): Promise<void> {
        let lang: string;
        if (this.state.defaultValue && this.state.defaultValue.value) {
            lang = this.state.defaultValue.value;
        } else {
            lang = await TranslationService.getSystemDefaultLanguage();
        }

        if (lang) {
            this.state.currentNode = this.state.nodes.find((n) => n.id === lang);
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
