/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';
import { DynamicFieldFormUtil } from '../../../../base-components/webapp/core/DynamicFieldFormUtil';
import { DynamicFieldValue } from '../../../../dynamic-fields/model/DynamicFieldValue';
import { ObjectFormValueMapper } from '../../ObjectFormValueMapper';
import { ObjectFormValue } from '../ObjectFormValue';
import { DynamicFieldCIReferenceFormValue } from './DynamicFieldCIReferenceFormValue';

export class DynamicFieldAffectedAssetFormValue extends DynamicFieldCIReferenceFormValue<Array<number>> {

    public constructor(
        public property: string,
        protected object: DynamicFieldValue,
        public objectValueMapper: ObjectFormValueMapper,
        public parent: ObjectFormValue,
        protected dfName: string
    ) {
        super(property, object, objectValueMapper, parent, dfName);
    }

    public findFormValue(property: string): ObjectFormValue {
        if (property === this.dfName) {
            return this;
        }

        return super.findFormValue(property);
    }

    public async initFormValueByField(field: FormFieldConfiguration): Promise<void> {
        await super.initFormValueByField(field);
        const value = await DynamicFieldFormUtil.getInstance().handleDynamicFieldValue(field);
        if (value) {
            if (this.value?.length) {
                if (Array.isArray(value)) {
                    this.value.push(...value);
                } else {
                    this.value.push(value);
                }
            } else if (Array.isArray(value)) {
                this.value = value;
            } else {
                this.value = [value];
            }
        }
    }

}