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
import { FormValueProperty } from '../../FormValueProperty';
import { ObjectFormValueMapper } from '../../ObjectFormValueMapper';
import { ObjectFormValue } from '../ObjectFormValue';
import { DynamicFieldFormValueCountHandler } from './DynamicFieldFormValueCountHandler';
import { ICountableFormValue } from './ICountableFromValue';

export class DynamicFieldTextAreaFormValue extends ObjectFormValue<string> implements ICountableFormValue {

    public dfValues: DynamicFieldValue[] = [];

    public constructor(
        public property: string,
        protected object: DynamicFieldValue,
        public objectValueMapper: ObjectFormValueMapper,
        public parent: ObjectFormValue,
        public dfName: string
    ) {
        super(property, object, objectValueMapper, parent);
        this.inputComponentId = 'textarea-form-input';
        this.addBindings();
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

        this.countDefault = Number(config?.CountDefault) || 0;
        this.countMax = Number(config?.CountMax) || 0;
        this.countMin = Number(config?.CountMin) || 0;
        await super.initFormValue();

        this.value = this.object[this.property];
    }

    public canAddValue(instanceId: string): boolean {
        return DynamicFieldFormValueCountHandler.canAddValue(this, instanceId);
    }

    public async addFormValue(instanceId: string, value: any): Promise<void> {
        await DynamicFieldFormValueCountHandler.addFormValue(this, instanceId, value);
        await super.addFormValue(instanceId, value);
    }

    public canRemoveValue(instanceId: string): boolean {
        return DynamicFieldFormValueCountHandler.canRemoveValue(this, instanceId);
    }

    public async removeFormValue(instanceId: string): Promise<void> {
        await DynamicFieldFormValueCountHandler.removeFormValue(this, instanceId);
        await super.removeFormValue(instanceId);
    }

    public setDFValue(): void {
        DynamicFieldFormValueCountHandler.setDFValue(this, super.setFormValue.bind(this));
    }

    private addBindings(): void {
        this.addPropertyBinding(FormValueProperty.COUNT_MAX, (value: ObjectFormValue) => this._countMax());
        // this.addPropertyBinding(FormValueProperty.COUNT_MIN, (value: ObjectFormValue) => this._countMin());
    }

    public async setFormValue(value: any, force?: boolean): Promise<void> {
        if (this.isCountHandler) {
            await DynamicFieldFormValueCountHandler.setFormValue(value, force, this, this.instanceId);
        } else {
            await super.setFormValue(value, force);
        }
    }

}