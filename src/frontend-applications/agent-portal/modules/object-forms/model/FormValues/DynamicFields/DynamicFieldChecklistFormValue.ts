/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { DynamicFieldValue } from '../../../../dynamic-fields/model/DynamicFieldValue';
import { CheckListItem } from '../../../../dynamic-fields/model/CheckListItem';
import { ObjectFormValueMapper } from '../../ObjectFormValueMapper';
import { ObjectFormValue } from '../ObjectFormValue';
import { DynamicFieldFormService } from '../../../../dynamic-fields/webapp/core';

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
        const dynamicField = await KIXObjectService.loadDynamicField(this.dfName);
        const config = dynamicField?.Config;

        const value = this.object[this.property];
        if (Array.isArray(value)) {
            this.value = value.length ? value[0] : null;
        } else {
            this.value = value;
        }

        if (!this.value && config?.DefaultValue) {
            this.setFormValue(config?.DefaultValue, true);
        } else if (typeof this.value === 'string') {
            this.setFormValue(this.value, true);
        }
    }

    public async setObjectValue(value: CheckListItem[]): Promise<void> {
        let v: string | CheckListItem[] = value;
        if (Array.isArray(v)) {
            for (const checklistItem of v) {
                (checklistItem as CheckListItem)?.mapInputStates();
            }
            v = JSON.stringify(value);
        }
        await super.setObjectValue(v);
    }

    public async setFormValue(value: any, force?: boolean): Promise<void> {
        try {
            let newValue;
            if (typeof value === 'string') {
                newValue = JSON.parse(value);
            } else {
                newValue = value;
            }

            if (Array.isArray(newValue)) {
                const checklist = [];
                for (const checklistItem of newValue) {
                    checklist.push(new CheckListItem(checklistItem));
                }
                newValue = checklist;
                DynamicFieldFormService.prepareChecklistConfig(newValue);
            }

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