import { ComponentState } from "./ComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import { Contact, FormInputComponent, KIXObjectType, ContextMode, TreeNode } from "@kix/core/dist/model";
import { FormService } from "@kix/core/dist/browser/form";

class Component extends FormInputComponent<Contact, ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public onMount(): void {
        super.onMount();
        this.state.searchCallback = this.searchContacts.bind(this);
        const formInstance = FormService.getInstance().getOrCreateFormInstance(this.state.formId);
        this.state.autoCompleteConfiguration = formInstance.getAutoCompleteConfiguration();
    }

    public contactChanged(nodes: TreeNode[]): void {
        this.state.currentNode = nodes && nodes.length ? nodes[0] : null;
        const contact = this.state.currentNode ? this.state.contacts.find(
            (cu) => cu.ContactID === this.state.currentNode.id
        ) : null;
        super.provideValue(contact);
    }

    private async searchContacts(limit: number, searchValue: string): Promise<TreeNode[]> {
        this.state.contacts = await ContextService.getInstance().loadObjects<Contact>(
            KIXObjectType.CONTACT, null, ContextMode.DETAILS, null, null, null, searchValue, limit
        );

        let treeNodes = [];
        if (searchValue && searchValue !== '') {
            treeNodes = this.state.contacts.map(
                (c) => new TreeNode(c.ContactID, c.DisplayValue, 'kix-icon-man-bubble')
            );
        }

        return treeNodes;
    }

}

module.exports = Component;
