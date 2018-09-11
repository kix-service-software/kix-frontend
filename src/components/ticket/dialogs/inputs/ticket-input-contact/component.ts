import { ComponentState } from "./ComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import {
    Contact, FormInputComponent, KIXObjectType,
    TreeNode, KIXObjectLoadingOptions
} from "@kix/core/dist/model";
import { FormService } from "@kix/core/dist/browser/form";

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
            this.state.currentNode = new TreeNode(contact.ContactID, contact.DisplayValue, 'kix-icon-man-bubble');
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
        this.contacts = await ContextService.getInstance().loadObjects<Contact>(
            KIXObjectType.CONTACT, null, loadingOptions
        );

        this.state.nodes = [];
        if (searchValue && searchValue !== '') {
            this.state.nodes = this.contacts.map(
                (c) => new TreeNode(c.ContactID, c.DisplayValue, 'kix-icon-man-bubble')
            );
        }

        return this.state.nodes;
    }

}

module.exports = Component;
