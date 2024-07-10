/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
import { ICountableFormValue } from './ICountableFormValue';

export class DynamicFieldCountableFormValue extends ObjectFormValue implements ICountableFormValue {

    public static readonly IS_COUNTABLE = true;

    public dfValues: DynamicFieldValue[] = [];
    public isEmpty: boolean = false;

    private initPromise: Promise<void>;

    private formValuesVisible: boolean = false;

    private initialized: boolean;

    protected field: FormFieldConfiguration;

    public constructor(
        public property: string,
        protected object: DynamicFieldValue,
        public objectValueMapper: ObjectFormValueMapper,
        public parent: ObjectFormValue,
        public dfName: string,
        public formValueConstructor: new (
            property: string,
            object: DynamicFieldValue,
            objectValueMapper: ObjectFormValueMapper,
            parent: ObjectFormValue,
            dfName: string
        ) => ObjectFormValue
    ) {
        super(property, object, objectValueMapper, parent);
        this.inputComponentId = 'count-handler-form-input';
        this.addBindings();
        this.isSortable = parent?.isSortable;
    }

    public findFormValue(property: string): ObjectFormValue {
        if (property === this.dfName) {
            return this;
        }

        return super.findFormValue(property);
    }

    private addBindings(): void {
        this.addPropertyBinding(FormValueProperty.COUNT_MAX, (value: ObjectFormValue) => this.applyCountMax());
        // this.addPropertyBinding(FormValueProperty.COUNT_MIN, (value: ObjectFormValue) => this._countMin());
    }

    public async initFormValue(): Promise<void> {
        if (!this.initPromise) {
            this.initPromise = new Promise<void>(async (resolve, reject) => {
                const dynamicField = await KIXObjectService.loadDynamicField(this.dfName);
                const config = dynamicField?.Config;

                this.countDefault = Number(config?.CountDefault) || 0;
                this.countMax = Number(config?.CountMax) || 0;
                this.countMin = Number(config?.CountMin) || 0;

                await this.initCountValues();
                this.initialized = true;
                await super.initFormValue();

                if (this.enabled && this.formValues?.length) {
                    for (const fv of this.formValues) {
                        await fv.enable();
                        fv.setNewInitialState(FormValueProperty.VISIBLE, true);
                    }
                }

                this.initPromise = null;

                await this.setVisibility(this.formValuesVisible);

                this.setNewInitialState(FormValueProperty.VISIBLE, this.visible);

                resolve();
            });
        }

        return this.initPromise;
    }

    public async initFormValueByField(field: FormFieldConfiguration): Promise<void> {
        await super.initFormValueByField(field);
        this.formValuesVisible = this.visible;
        this.field = field;
    }

    public async setFormValue(value: any, force?: boolean): Promise<void> {
        if (force) {
            this.clearFormValues();

            this.value = value;

            if (this.initialized) {
                await this.initCountValues();
            }

            this.setVisibility(true);
        } else {
            super.setFormValue(value, force);
        }
    }

    protected clearFormValues(): void {
        for (const formValue of this.formValues) {
            formValue.destroy();
        }

        this.dfValues = [];
        this.formValues = [];
    }

    public async initCountValues(): Promise<void> {
        this.setCountMinDefMax();

        if (this.value && !Array.isArray(this.value)) {
            this.value = [this.value] as any;
        }

        if (this.value?.length) {
            for (const v of this.value) {
                await this.addFormValue(this.instanceId, v, true);
            }
        }

        if (this.formValues.length < this.countDefault) {
            await this.addDefaultFormValues();
        }
    }

    protected async addDefaultFormValues(): Promise<void> {
        const startIndex = this.formValues?.length || 0;
        for (let i = startIndex; i < this.countDefault; i++) {
            await this.addFormValue(null, null, true);
        }
    }

    private setCountMinDefMax(): void {
        if (this.countMax > 0 && this.countMin > this.countMax) {
            this.countMin = this.countMax;
        }

        if (this.countMax > 0 && this.countDefault > this.countMax) {
            this.countDefault = this.countMax;
        }

        if (this.countDefault < this.countMin) {
            this.countDefault = this.countMin;
        }

        this.setNewInitialState('countMin', this.countMin);
        this.setNewInitialState('countMax', this.countMax);
        this.setNewInitialState('countDefault', this.countDefault);
    }

    public canAddValue(instanceId: string): boolean {
        let canAdd = false;

        const index = this.formValues.findIndex((fv) => fv.instanceId === instanceId);

        const length = this.dfValues?.length || 0;
        const countMax = this.countMax;
        const countMin = this.countMin;
        canAdd = ((countMax >= countMin) && countMax > 0 && length < countMax) || countMax === 0;
        canAdd = canAdd && (index === this.formValues.length - 1 || this.instanceId === instanceId);

        return canAdd;
    }

    public async addFormValue(instanceId: string, value: any, force?: boolean): Promise<void> {
        if (this.formValueConstructor && (this.canAddValue(instanceId) || force)) {
            const dfValue = new DynamicFieldValue();
            dfValue.Name = this.dfName;
            this.dfValues.push(dfValue);

            const fv = new this.formValueConstructor('Value', dfValue, this.objectValueMapper, this, this.dfName);
            fv.parent = this;

            if (this.field) {
                await fv.initFormValueByField(this.field);
            }

            fv.enabled = this.enabled;
            fv.isSetInBackground = this.isSetInBackground;
            if (!fv.isSetInBackground) {
                fv.visible = true;
                fv.setNewInitialState(FormValueProperty.VISIBLE, true);
            }

            fv.isSortable = false;
            fv.readonly = this.readonly;
            fv.required = this.required;
            fv.label = this.label;
            fv.hint = this.hint;

            (fv as any).IS_COUNTABLE = true;

            await fv.initFormValue();

            this.formValues = [...this.formValues, fv];

            fv.setInitialState();
            await fv.setFormValue(value || this.defaultValue, force);

            this.setDFValue();

            await this.setVisibility(this.formValuesVisible);

            fv.addPropertyBinding(FormValueProperty.VALUE, () => {
                this.setDFValue();
            });
        }
    }

    public canRemoveValue(instanceId: string): boolean {
        const length = this.dfValues?.length || 0;
        const countMin = this.countMin || 0;
        return length > countMin && countMin >= 0 && this.instanceId !== instanceId;
    }

    public async removeFormValue(instanceId: string): Promise<void> {
        const index = this.formValues.findIndex((fv) => fv.instanceId === instanceId);
        if (index !== -1 && this.canRemoveValue(instanceId)) {
            this.formValues[index].destroy();
            this.formValues.splice(index, 1);
            this.formValues = [...this.formValues];
            this.dfValues.splice(index, 1);
        }

        this.setDFValue();
        this.visible = this.formValues.length === 0;
        this.setNewInitialState(FormValueProperty.VISIBLE, this.visible);
    }

    public setDFValue(force?: boolean): void {
        const value = [];
        const dfValues = this.dfValues;
        if (Array.isArray(dfValues)) {
            for (const dfv of dfValues) {
                if (Array.isArray(dfv.Value)) {
                    if (dfv.Value.length) {
                        value.push(dfv.Value[0]);
                    }
                } else if (typeof dfv.Value !== 'undefined' && dfv.Value !== null) {
                    value.push(dfv.Value);
                }
            }
        }

        this.setFormValue(value, force);
    }

    protected async applyCountMax(): Promise<void> {
        if (this.countMax < this.formValues.length) {
            const difference = this.formValues.length - this.countMax;
            for (let i = 0; i < difference; i++) {
                const index = this.formValues.length - 1;
                await this.removeFormValue(this.formValues[index].instanceId);
            }
        }
    }

    public async disable(): Promise<void> {
        await super.disable();

        if (this.formValues?.length) {
            for (const fv of this.formValues) {
                await this.removeFormValue(fv.instanceId);
            }
        }

        this.formValues = [];
        this.value = [];
        this.dfValues = [];
        this.initialized = true;
    }

    public async show(): Promise<void> {
        await this.setVisibility(true);
        this.formValuesVisible = true;
    }

    public async hide(): Promise<void> {
        await super.hide();
        this.formValuesVisible = false;
        await this.setVisibility(false);
    }

    private async setVisibility(show?: boolean): Promise<void> {
        if (show) {
            this.visible = this.formValues.length === 0;
            for (const fv of this.formValues) {
                if (this.visible) {
                    await fv.hide();
                } else {
                    await fv.show();
                }
            }
        } else {
            this.visible = false;
            for (const fv of this.formValues) {
                await fv.hide();
            }
        }
        this.setNewInitialState(FormValueProperty.VISIBLE, this.visible);
    }

}