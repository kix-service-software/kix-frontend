import { ComponentState } from "./ComponentState";
import {
    Contact, FormInputComponent, KIXObjectType,
    TreeNode, KIXObjectLoadingOptions
} from "../../../../../core/model";
import { FormService } from "../../../../../core/browser/form";
import { KIXObjectService } from "../../../../../core/browser";

class Component extends FormInputComponent<string, ComponentState> {

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

    public async setCurrentNode(): Promise<void> {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            const contacts = await KIXObjectService.loadObjects<Contact>(
                KIXObjectType.CONTACT, [this.state.defaultValue.value]
            );
            if (contacts && contacts.length) {
                const contact = contacts[0];
                this.state.currentNode = this.createTreeNode(contact);
                this.state.nodes = [this.state.currentNode];
                super.provideValue(contact.ContactID);
            }
        }
    }

    public contactChanged(nodes: TreeNode[]): void {
        this.state.currentNode = nodes && nodes.length ? nodes[0] : null;
        super.provideValue(this.state.currentNode ? this.state.currentNode.id : null);
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
