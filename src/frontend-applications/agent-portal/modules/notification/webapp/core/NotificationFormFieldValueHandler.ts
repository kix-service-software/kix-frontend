/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldValueHandler } from '../../../base-components/webapp/core/FormFieldValueHandler';
import { FormInstance } from '../../../base-components/webapp/core/FormInstance';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { FormFieldValue } from '../../../../model/configuration/FormFieldValue';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { NotificationProperty } from '../../model/NotificationProperty';
import { ServiceRegistry } from '../../../base-components/webapp/core/ServiceRegistry';
import { NotificationFormService } from './NotificationFormService';
import { ServiceType } from '../../../base-components/webapp/core/ServiceType';

export class NotificationFormFieldValueHandler extends FormFieldValueHandler {

    public objectType: string = KIXObjectType.NOTIFICATION;

    public id: string = 'NotificationFormFieldValueHandler';

    public async handleFormFieldValues(
        formInstance: FormInstance, changedFieldValues: Array<[FormFieldConfiguration, FormFieldValue]>
    ): Promise<void> {
        const fieldRegEx = new RegExp(`^${NotificationProperty.MESSAGE_CONTENTTYPE}###(.+)$`);

        const contentTypeValue = changedFieldValues.find(
            (cv) => cv[0] && cv[0].property.match(fieldRegEx)
        );
        if (contentTypeValue && contentTypeValue[1]) {
            const field = contentTypeValue[0];
            const value = contentTypeValue[1];

            const formService = ServiceRegistry.getServiceInstance<NotificationFormService>(
                KIXObjectType.NOTIFICATION, ServiceType.FORM
            );

            if (value.value) {
                const contentTypeFields = await formService.getFormFieldsForContentType(
                    formInstance, field, value.value, formInstance.getForm().id, true
                );
                formInstance.addFieldChildren(field, contentTypeFields, true);
            } else {
                formInstance.addFieldChildren(field, [], true);
            }
        }
    }

}
