/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { DynamicFieldValue } from '../../../../dynamic-fields/model/DynamicFieldValue';
import { CheckListItem } from '../../../../dynamic-fields/model/CheckListItem';
import { ObjectFormValueMapper } from '../../ObjectFormValueMapper';
import { ObjectFormValue } from '../ObjectFormValue';
import { DynamicFieldService } from '../../../../dynamic-fields/webapp/core/DynamicFieldService';
import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { FormFieldValue } from '../../../../../model/configuration/FormFieldValue';

export class DynamicFieldChecklistFormValue extends ObjectFormValue<CheckListItem[]> {

    public constructor(
        public property: string,
        protected object: DynamicFieldValue,
        public objectValueMapper: ObjectFormValueMapper,
        public parent: ObjectFormValue,
        protected dfName: string
    ) {
        super(property, object, objectValueMapper, parent);

        this.inputComponentId = 'checklist-form-input';

        const checklist = Array.isArray(object[property]) && object[property].length
            ? object[property][0]
            : object[property];
        this.value = DynamicFieldService.parseChecklist(checklist);
    }

    public findFormValue(property: string): ObjectFormValue {
        if (property === this.dfName) {
            return this;
        }

        return super.findFormValue(property);
    }

    public async initFormValueByField(field: FormFieldConfiguration): Promise<void> {
        const dynamicField = await KIXObjectService.loadDynamicField(this.dfName);
        const config = dynamicField?.Config;
        field.defaultValue = new FormFieldValue(config?.DefaultValue);
        return super.initFormValueByField(field);
    }

    public async setObjectValue(value: CheckListItem[]): Promise<void> {
        let v: string | CheckListItem[] = value;
        if (Array.isArray(v)) {
            v = JSON.stringify(value);
        }
        await super.setObjectValue(v);
    }

    public async setFormValue(value: any, force?: boolean): Promise<void> {
        try {
            const newValue = DynamicFieldService.parseChecklist(value);

            await super.setFormValue(newValue, force);
            await this.setObjectValue(newValue);
        } catch (e) {
            console.error(e);
        }
    }

    protected isSameValue(value: any): boolean {
        return false;
    }
}