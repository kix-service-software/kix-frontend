/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { DynamicFieldValue } from '../../../../dynamic-fields/model/DynamicFieldValue';
import { CheckListItem } from '../../../../dynamic-fields/webapp/core/CheckListItem';
import { ObjectFormValueMapper } from '../../ObjectFormValueMapper';
import { ObjectFormValue } from '../ObjectFormValue';

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
    }

    public findFormValue(property: string): ObjectFormValue {
        if (property === this.dfName) {
            return this;
        }

        return super.findFormValue(property);
    }

    public async initFormValue(): Promise<void> {
        await super.initCountValues();
        const dynamicField = await KIXObjectService.loadDynamicField(this.dfName);
        const config = dynamicField?.Config;

        const value = this.object[this.property];
        if (Array.isArray(value) && value.length) {
            this.value = value[0];
        } else {
            this.value = value;
        }

        if (!this.value && config?.DefaultValue) {
            this.setFormValue(config?.DefaultValue);
        } else if (typeof this.value === 'string') {
            this.setFormValue(this.value);
        }
    }

    public async setObjectValue(value: CheckListItem[]): Promise<void> {
        let v: string | CheckListItem[] = value;
        if (Array.isArray(v)) {
            v = JSON.stringify(value);
        }
        await super.setObjectValue(v);
    }

    public async setFormValue(value: any): Promise<void> {
        try {
            if (typeof value === 'string') {
                this.value = JSON.parse(value);
            } else {
                this.value = value;
            }
        } catch (e) {
            console.error(e);
        }
    }
}