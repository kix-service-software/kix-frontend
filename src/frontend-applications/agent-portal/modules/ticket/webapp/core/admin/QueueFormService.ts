/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFormService } from '../../../../../modules/base-components/webapp/core/KIXObjectFormService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { FormConfiguration } from '../../../../../model/configuration/FormConfiguration';
import { FormFieldValue } from '../../../../../model/configuration/FormFieldValue';
import { Queue } from '../../../model/Queue';
import { FormContext } from '../../../../../model/configuration/FormContext';
import { QueueProperty } from '../../../model/QueueProperty';
import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';
import { LabelService } from '../../../../../modules/base-components/webapp/core/LabelService';
import { IdService } from '../../../../../model/IdService';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { FormInstance } from '../../../../base-components/webapp/core/FormInstance';

export class QueueFormService extends KIXObjectFormService {

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

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.QUEUE;
    }

    protected async getValue(
        property: string, value: any, queue: Queue,
        formField: FormFieldConfiguration, formContext: FormContext
    ): Promise<any> {
        switch (property) {
            case QueueProperty.NAME:
                if (formContext === FormContext.NEW && queue) {
                    value = await TranslationService.translate(
                        'Translatable#Copy of {0}', [value]
                    );
                }
                break;
            default:
                value = super.getValue(property, value, queue, formField, formContext);
        }

        return value;
    }

    protected async postPrepareForm(
        form: FormConfiguration, formInstance: FormInstance,
        formFieldValues: Map<string, FormFieldValue<any>>, queue: Queue
    ): Promise<void> {
        if (form && form.formContext === FormContext.EDIT) {
            PAGES:
            for (const p of form.pages) {
                for (const g of p.groups) {
                    for (const f of g.formFields) {
                        if (f.property === QueueProperty.FOLLOW_UP_ID) {
                            if (formFieldValues.get(f.instanceId).value === 1) {
                                await this.setFollowUpLock(f, formFieldValues, queue);
                            }
                            break PAGES;
                        }
                    }
                }
            }
        }
    }

    private async setFollowUpLock(
        followUpField: FormFieldConfiguration, formFieldValues: Map<string, FormFieldValue<any>>, queue?: Queue
    ): Promise<void> {
        const label = await LabelService.getInstance().getPropertyText(
            QueueProperty.FOLLOW_UP_LOCK, KIXObjectType.QUEUE
        );
        const value = Boolean(
            typeof queue.FollowUpLock !== 'undefined' && queue.FollowUpLock !== null ?
                Number(queue.FollowUpLock) : 0
        );
        const lockField = new FormFieldConfiguration(
            'followup-field',
            label, QueueProperty.FOLLOW_UP_LOCK, 'checkbox-input', false,
            'Translatable#Helptext_Admin_QueueEdit_FollowUpTicketLock', null,
            new FormFieldValue(value)
        );
        followUpField.children.push(lockField);
        lockField.instanceId = IdService.generateDateBasedId(lockField.property);
        formFieldValues.set(lockField.instanceId, new FormFieldValue(value));
    }

    public async prepareCreateValue(
        property: string, formField: FormFieldConfiguration, value: any
    ): Promise<Array<[string, any]>> {
        switch (property) {
            case QueueProperty.FOLLOW_UP_LOCK:
                value = Number(value);
                break;
            default:
        }
        return [[property, value]];
    }
}
