import { KIXObjectFormService } from "../../kix/KIXObjectFormService";
import { KIXObjectType, Queue, FormField, FormFieldValue, QueueProperty, Form, ContextType } from "../../../model";
import { LabelService } from "../../LabelService";
import { ContextService } from "../../context";
import { QueueDetailsContext } from "./context";

export class QueueFormService extends KIXObjectFormService<Queue> {

    private static INSTANCE: QueueFormService = null;

    public static getInstance(): QueueFormService {
        if (!QueueFormService.INSTANCE) {
            QueueFormService.INSTANCE = new QueueFormService();
        }

        return QueueFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.QUEUE;
    }

    public async initValues(form: Form): Promise<Map<string, FormFieldValue<any>>> {
        const formFieldValues = await super.initValues(form);

        const context = await ContextService.getInstance().getContext<QueueDetailsContext>(
            QueueDetailsContext.CONTEXT_ID
        );

        if (context) {
            const queue = await context.getObject<Queue>();
            groupLoop: for (const g of form.groups) {
                for (const f of g.formFields) {
                    if (f.property === QueueProperty.FOLLOW_UP_ID) {
                        if (formFieldValues.get(f.instanceId).value === 1) {
                            await this.setFollowUpLock(f, formFieldValues, queue);
                        }
                        break groupLoop;
                    }
                }
            }
        }

        return formFieldValues;
    }

    private async setFollowUpLock(
        followUpField: FormField, formFieldValues: Map<string, FormFieldValue<any>>, queue?: Queue
    ): Promise<void> {
        const label = await LabelService.getInstance().getPropertyText(
            QueueProperty.FOLLOW_UP_LOCK, KIXObjectType.QUEUE
        );
        const value = Boolean(
            typeof queue.FollowUpLock !== 'undefined' && queue.FollowUpLock !== null ?
                Number(queue.FollowUpLock) : 0
        );
        const lockField = new FormField(
            label, QueueProperty.FOLLOW_UP_LOCK, 'checkbox-input', false,
            'Translatable#Helptext_Admin_QueueEdit_FollowUpTicketLock', null,
            new FormFieldValue(value)
        );
        followUpField.children.push(lockField);
        formFieldValues.set(lockField.instanceId, new FormFieldValue(value));
    }
}
