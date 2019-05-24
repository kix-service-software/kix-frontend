import { ComponentState } from "./ComponentState";
import {
    TreeNode, KIXObjectType, QueueProperty, FormField, FormFieldValue
} from "../../../../../../core/model";
import { PendingTimeFormValue, QueueService } from "../../../../../../core/browser/ticket";
import { FormInputComponent } from '../../../../../../core/model/components/form/FormInputComponent';
import { FormService, LabelService } from "../../../../../../core/browser";
import { TranslationService } from "../../../../../../core/browser/i18n/TranslationService";

class Component extends FormInputComponent<PendingTimeFormValue, ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
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

        this.state.nodes = await QueueService.getInstance().getTreeNodes(QueueProperty.FOLLOW_UP_ID);
        this.setCurrentNode();
        this.showFollowUpLock();
    }

    protected setCurrentNode(): void {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            if (this.state.defaultValue.value) {
                this.followUpChanged(
                    [
                        this.state.nodes.find((n) => n.id === this.state.defaultValue.value)
                    ]
                );
            }
        }
    }

    public followUpChanged(nodes: TreeNode[]): void {
        this.state.currentNode = nodes && nodes.length ? nodes[0] : null;

        super.provideValue(this.state.currentNode ? this.state.currentNode.id : null);
        this.showFollowUpLock();
    }

    private async showFollowUpLock(): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        let field = this.state.field.children.find((f) => f.property === QueueProperty.FOLLOW_UP_LOCK);
        const showLockField = this.showFollowUpLockField();
        if (field && !showLockField) {
            formInstance.removeFormField(field, this.state.field);
        } else if (!field && showLockField) {
            const label = await LabelService.getInstance().getPropertyText(
                QueueProperty.FOLLOW_UP_LOCK, KIXObjectType.QUEUE
            );
            field = new FormField(
                label, QueueProperty.FOLLOW_UP_LOCK, 'checkbox-input', false,
                'Translatable#Helptext_Admin_QueueCreate_FollowUpTicketLock', null,
                new FormFieldValue(true)
            );
            formInstance.addNewFormField(this.state.field, [field]);
        }
    }

    private showFollowUpLockField(): boolean {
        let show = false;
        if (this.state.currentNode && this.state.currentNode.id === 1) {
            show = true;
        }
        return show;
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }
}

module.exports = Component;
