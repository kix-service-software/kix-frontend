/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { DynamicFieldValue } from '../../../../dynamic-fields/model/DynamicFieldValue';
import { FormValueProperty } from '../../FormValueProperty';
import { ObjectFormValueMapper } from '../../ObjectFormValueMapper';
import { ObjectFormValue } from '../ObjectFormValue';
import { DynamicFieldFormValueCountHandler } from './DynamicFieldFormValueCountHandler';
import { ICountableFormValue } from './ICountableFromValue';

export class DynamicFieldTextFormValue extends ObjectFormValue<string | string[]> implements ICountableFormValue {

    public dfValues: DynamicFieldValue[] = [];
    public isEmpty: boolean = false;

    public constructor(
        public property: string,
        protected object: DynamicFieldValue,
        public objectValueMapper: ObjectFormValueMapper,
        public parent: ObjectFormValue,
        public dfName: string,
    ) {
        super(property, object, objectValueMapper, parent);
        this.inputComponentId = 'text-form-input';
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

        this.regExList = config?.RegExList?.map(
            (ri) => { return { regEx: ri.Value, errorMessage: ri.ErrorMessage }; }
        ) || [];
        this.setValueByDefault(config);

        await super.initFormValue();
        this.value = this.object[this.property];
    }

    private setValueByDefault(config: any): void {
        const isDefaultValueDefined = config?.DefaultValue !== ''
            && config?.DefaultValue !== null
            && typeof config?.DefaultValue !== 'undefined';

        let defaultValue = null;
        if (isDefaultValueDefined) {
            defaultValue = config?.DefaultValue;
        }

        if (
            !this.value
            && defaultValue !== null
            && !this.isEmpty
        ) {
            this.value = defaultValue;
        }
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

        this.addPropertyBinding(FormValueProperty.ENABLED, async (value: ObjectFormValue) => {
            if (this.enabled) {
                await this.initCountValues();
            }
        });
    }

    public async setFormValue(value: any, force?: boolean): Promise<void> {
        if (this.isCountHandler) {
            await DynamicFieldFormValueCountHandler.setFormValue(value, force, this, this.instanceId);
        } else {
            await super.setFormValue(value, force);
        }
    }

    public async initFormValueByField(field: FormFieldConfiguration): Promise<void> {

        this.isEmpty = field?.empty || false;
        super.initFormValueByField(field);
    }

}