/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { FormFieldValue } from '../../../../model/configuration/FormFieldValue';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { AdditionalContextInformation } from '../../../base-components/webapp/core/AdditionalContextInformation';
import { ContextService } from '../../../base-components/webapp/core/ContextService';
import { FormFieldValueHandler } from '../../../base-components/webapp/core/FormFieldValueHandler';
import { FormInstance } from '../../../base-components/webapp/core/FormInstance';
import { Webform } from '../../model/Webform';
import { WebformProperty } from '../../model/WebformProperty';

export class WebformFormFieldValueHandler extends FormFieldValueHandler {

    public id: string = 'WebformFormValueHandler';
    public objectType: string = KIXObjectType.WEBFORM;

    public async postInitValues(formInstance: FormInstance): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        context?.setAdditionalInformation(AdditionalContextInformation.FORM_OBJECT, new Webform());
        const queueValue = await formInstance.getFormFieldValueByProperty(WebformProperty.QUEUE_ID);
        this.setQueueId(queueValue);
    }

    public async handleFormFieldValues(
        formInstance: FormInstance, changedFieldValues: Array<[FormFieldConfiguration, FormFieldValue]>
    ): Promise<void> {
        const queueValue = changedFieldValues.find(
            (cv) => cv[0] && cv[0].property === WebformProperty.QUEUE_ID
        );
        this.setQueueId(queueValue[1]);
    }

    private setQueueId(queueValue: FormFieldValue): void {
        if (queueValue) {
            const context = ContextService.getInstance().getActiveContext();
            const formObject = context?.getAdditionalInformation(AdditionalContextInformation.FORM_OBJECT);
            if (formObject instanceof Webform) {
                if (Array.isArray(queueValue.value) && queueValue.value.length) {
                    formObject.QueueID = queueValue.value[0];
                } else {
                    formObject.QueueID = queueValue.value;
                }
            }
        }
    }

}