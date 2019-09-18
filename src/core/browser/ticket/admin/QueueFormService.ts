/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFormService } from "../../kix/KIXObjectFormService";
import {
    KIXObjectType, Queue, FormField, FormFieldValue, QueueProperty, Form, FormContext
} from "../../../model";
import { LabelService } from "../../LabelService";

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

    protected async doAdditionalPreparations(
        form: Form, formFieldValues: Map<string, FormFieldValue<any>>, queue: Queue
    ): Promise<void> {
        if (form && form.formContext === FormContext.EDIT) {
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
