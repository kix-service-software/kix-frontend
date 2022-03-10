/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { ContactProperty } from '../../model/ContactProperty';

export class ContactFormFieldValueHandler extends FormFieldValueHandler {

    public objectType: string = KIXObjectType.CONTACT;

    public id: string = 'ContactFormFieldValueHandler';

    public async handleFormFieldValues(
        formInstance: FormInstance, changedFieldValues: Array<[FormFieldConfiguration, FormFieldValue]>
    ): Promise<void> {
        const orgIdsValue = changedFieldValues.find(
            (cv) => cv[0] && cv[0].property === ContactProperty.ORGANISATION_IDS
        );
        if (orgIdsValue) {
            const possiblePrimaryOrgIds = Array.isArray(orgIdsValue[1].value) ? orgIdsValue[1].value : [];

            this.setCurrentValue(formInstance, possiblePrimaryOrgIds);

            // provide possible values for primary
            formInstance.setPossibleValue(
                ContactProperty.PRIMARY_ORGANISATION_ID, new FormFieldValue(possiblePrimaryOrgIds)
            );
        }
    }

    private setCurrentValue(formInstance: FormInstance, possiblePrimaryOrgIds: number[]): void {
        const field = formInstance.getFormFieldByProperty(ContactProperty.PRIMARY_ORGANISATION_ID);
        if (field) {
            // set primary if only one id is in organisation list
            if (possiblePrimaryOrgIds.length === 1) {
                formInstance.provideFormFieldValues([[field.instanceId, possiblePrimaryOrgIds[0]]], null);
            } else {
                // check if current value is in list, else set null
                const currentPrimaryValue = formInstance.getFormFieldValue(field.instanceId);
                const primaryID = currentPrimaryValue?.value ?
                    Array.isArray(currentPrimaryValue.value) ?
                        currentPrimaryValue.value[0] :
                        currentPrimaryValue.value :
                    null;
                if (primaryID && !possiblePrimaryOrgIds.some((id) => id === primaryID)) {
                    formInstance.provideFormFieldValues([[field.instanceId, null]], null);
                }
            }
        }
    }

    public async postInitValues(formInstance: FormInstance): Promise<void> {
        const orgIdsValue = await formInstance.getFormFieldValueByProperty(ContactProperty.ORGANISATION_IDS);

        // provide possible values for primary
        formInstance.setPossibleValue(
            ContactProperty.PRIMARY_ORGANISATION_ID, new FormFieldValue(
                Array.isArray(orgIdsValue?.value) ? orgIdsValue.value : []
            )
        );
    }
}
