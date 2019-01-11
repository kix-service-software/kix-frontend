import { ComponentState } from "./ComponentState";
import { ContextService } from "../../../../../core/browser/context";
import {
    Contact, FormInputComponent, KIXObjectType,
    TreeNode, KIXObjectLoadingOptions
} from "../../../../../core/model";
import { FormService } from "../../../../../core/browser/form";
import { KIXObjectService } from "../../../../../core/browser";

class Component extends FormInputComponent<Contact, ComponentState> {

    private contacts: Contact[];

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onInput(input: any): Promise<void> {
        await super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.state.searchCallback = this.searchContacts.bind(this);
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        this.state.autoCompleteConfiguration = formInstance.getAutoCompleteConfiguration();
        this.setCurrentNode();
    }

    public setCurrentNode(): void {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            const contact = this.state.defaultValue.value;
            this.state.currentNode = this.createTreeNode(contact);
            this.state.nodes = [this.state.currentNode];
            super.provideValue(contact);
        }
    }

    public contactChanged(nodes: TreeNode[]): void {
        this.state.currentNode = nodes && nodes.length ? nodes[0] : null;
        const contact = this.state.currentNode ? this.contacts.find(
            (cu) => cu.ContactID === this.state.currentNode.id
        ) : null;
        super.provideValue(contact);
    }

    private async searchContacts(limit: number, searchValue: string): Promise<TreeNode[]> {
        const loadingOptions = new KIXObjectLoadingOptions(null, null, null, searchValue, limit);
        this.contacts = await KIXObjectService.loadObjects<Contact>(
            KIXObjectType.CONTACT, null, loadingOptions, null, false
        );

        this.state.nodes = [];
        if (searchValue && searchValue !== '') {
            this.state.nodes = this.contacts.map(
                (c) => this.createTreeNode(c)
            );
        }

        return this.state.nodes;
    }

    private createTreeNode(contact: Contact): TreeNode {
        return new TreeNode(contact.ContactID, contact.DisplayValue, 'kix-icon-man-bubble');
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }
}

module.exports = Component;
