import { ComponentState } from "./ComponentState";
import {
    FormInputComponent, TreeNode, TicketProperty, FormField,
    FormFieldValue, Queue, KIXObjectType, ContextType, ContextMode, Ticket
} from "../../../../../core/model";
import { FormService, KIXObjectService, ContextService } from "../../../../../core/browser";
import { TicketDetailsContext } from "../../../../../core/browser/ticket";
import { ObjectDataService } from "../../../../../core/browser/ObjectDataService";
import { TranslationService } from "../../../../../core/browser/i18n/TranslationService";

class Component extends FormInputComponent<number, ComponentState> {

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

        const context = ContextService.getInstance().getActiveContext(ContextType.DIALOG);
        const objectTypes = context.getDescriptor().kixObjectTypes;
        const contextMode = context.getDescriptor().contextMode;

        if (objectTypes.some((ot) => ot === KIXObjectType.ARTICLE) && contextMode === ContextMode.CREATE_SUB) {
            this.initValuesByContext();
        } else if (objectTypes.some((ot) => ot === KIXObjectType.TICKET)
            && (contextMode === ContextMode.EDIT || contextMode === ContextMode.CREATE)) {
            this.initValuesByForm();
        }
    }

    private async initValuesByContext(): Promise<void> {
        const context = await ContextService.getInstance().getContext<TicketDetailsContext>(
            TicketDetailsContext.CONTEXT_ID
        );

        if (context) {
            const ticket = await context.getObject<Ticket>();
            if (ticket) {
                this.initNodes(ticket.QueueID);
            }
        }
    }

    private async initValuesByForm(): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        const queueValue = await formInstance.getFormFieldValueByProperty<number>(TicketProperty.QUEUE_ID);
        if (queueValue && queueValue.value) {
            this.initNodes(queueValue.value);
        }

        formInstance.registerListener({
            formListenerId: 'article-email-from-input',
            formValueChanged: async (formField: FormField, value: FormFieldValue<any>, oldValue: any) => {
                if (formField.property === TicketProperty.QUEUE_ID) {
                    if (!value) {
                        value = await formInstance.getFormFieldValueByProperty(TicketProperty.QUEUE_ID);
                    }

                    if (value && value.value) {
                        this.initNodes(value.value);
                    }

                }
            },
            updateForm: () => { return; }
        });
    }

    private async initNodes(queueId: number): Promise<void> {
        const queues = await KIXObjectService.loadObjects<Queue>(KIXObjectType.QUEUE, [queueId]);
        if (queues && queues.length) {
            const user = ObjectDataService.getInstance().getObjectData().currentUser;

            const queue = queues[0];

            const userName = `${user.UserFirstname} ${user.UserLastname}`;
            const queueMail = queue.Email;
            const realName = queue.RealName;

            const labels = [
                [`\"<${realName}>\" <${queueMail}>`, `${realName}`],
                [`<${userName}> \"via\" <${realName}> <${queueMail}>`, `${userName} via ${realName}`],
                [`<${userName}> <${queueMail}>`, `${userName}`]
            ];

            const nodes = [];
            labels.forEach((l) => nodes.push(new TreeNode(l[0], l[1])));

            this.state.nodes = nodes;
            this.fromChanged([nodes[0]]);
        }
    }

    public fromChanged(nodes: TreeNode[]): void {
        this.state.currentNode = nodes && nodes.length ? nodes[0] : null;
        super.provideValue(this.state.currentNode ? this.state.currentNode.id : null);
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }
}

module.exports = Component;
