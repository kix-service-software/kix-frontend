import { ComponentState } from "./ComponentState";
import {
    Contact, FormInputComponent, KIXObjectType, TreeNode, KIXObjectLoadingOptions,
    AutoCompleteConfiguration, FormField, FilterCriteria, ContactProperty, FilterDataType, FilterType
} from "../../../../../core/model";
import { FormService, FormInputAction } from "../../../../../core/browser/form";
import { KIXObjectService, Label, LabelService, SearchOperator } from "../../../../../core/browser";

class Component extends FormInputComponent<string[], ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.state.searchCallback = this.searchContacts.bind(this);
        const objectName = await LabelService.getInstance().getObjectName(KIXObjectType.CONTACT, true, false);
        this.state.autoCompleteConfiguration = new AutoCompleteConfiguration(10, 2000, 3, objectName);

        this.prepareActions();
        this.setCurrentNodes();
    }

    public async setCurrentNodes(): Promise<void> {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            const contactEmails: any[] = Array.isArray(this.state.defaultValue.value)
                ? this.state.defaultValue.value : [this.state.defaultValue.value];

            // TODO: nicht sehr performant
            const contacts = await KIXObjectService.loadObjects<Contact>(KIXObjectType.CONTACT, null,
                new KIXObjectLoadingOptions(
                    null,
                    contactEmails.map((email) => new FilterCriteria(
                        ContactProperty.USER_EMAIL, SearchOperator.EQUALS, FilterDataType.STRING,
                        FilterType.OR, email
                    ))

                )
            );
            if (contacts && !!contacts.length) {
                const nodes = [];
                for (const object of contacts) {
                    nodes.push(await this.createTreeNode(object));
                }
                this.state.nodes = nodes;
                this.state.currentNodes = nodes;
            }

            this.contactChanged(this.state.currentNodes);
        }
    }

    private async prepareActions(): Promise<void> {
        const additionalTypeOption = this.state.field.options.find((o) => o.option === 'ADDITIONAL_RECIPIENT_TYPES');
        const actions = [];
        if (additionalTypeOption && additionalTypeOption.value && Array.isArray(additionalTypeOption.value)) {
            const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
            for (const property of additionalTypeOption.value) {
                const label = await LabelService.getInstance().getPropertyText(
                    property, KIXObjectType.ARTICLE
                );
                const currentValue = formInstance ? await formInstance.getFormFieldValueByProperty(property) : null;
                const action = new FormInputAction(
                    property, new Label(null, property, null, label), this.actionClicked.bind(this),
                    currentValue ? true : false
                );
                actions.push(action);
            }
        }
        this.state.actions = actions;
    }

    private async actionClicked(action: FormInputAction): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        let field = this.state.field.children.find((f) => f.property === action.id);
        if (field) {
            formInstance.removeFormField(field, this.state.field);
        } else {
            const label = await LabelService.getInstance().getPropertyText(action.id, KIXObjectType.ARTICLE);
            field = new FormField(
                label, action.id, 'article-email-recipient-input', false, label
            );
            formInstance.addNewFormField(this.state.field, [field]);
        }
        (this as any).setStateDirty('actions');
    }

    public contactChanged(nodes: TreeNode[]): void {
        this.state.currentNodes = nodes;
        super.provideValue(nodes.map((n) => n.id));
    }

    private async searchContacts(limit: number, searchValue: string): Promise<TreeNode[]> {
        const loadingOptions = new KIXObjectLoadingOptions(null, null, null, searchValue, limit);
        const contacts = await KIXObjectService.loadObjects<Contact>(
            KIXObjectType.CONTACT, null, loadingOptions, null, false
        );

        this.state.nodes = [];
        if (searchValue && searchValue !== '') {
            this.state.nodes = contacts.filter((c) => c.UserEmail).map(
                (c) => this.createTreeNode(c)
            );
        }

        return this.state.nodes;
    }

    private createTreeNode(contact: Contact): TreeNode {
        return new TreeNode(contact.UserEmail, contact.DisplayValue, 'kix-icon-man-bubble');
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }
}

module.exports = Component;
