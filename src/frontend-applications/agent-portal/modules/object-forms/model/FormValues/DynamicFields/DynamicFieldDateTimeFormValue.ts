/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { DateTimeUtil } from '../../../../base-components/webapp/core/DateTimeUtil';
import { InputFieldTypes } from '../../../../base-components/webapp/core/InputFieldTypes';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { DynamicFieldTypes } from '../../../../dynamic-fields/model/DynamicFieldTypes';
import { DynamicFieldValue } from '../../../../dynamic-fields/model/DynamicFieldValue';
import { FormValueProperty } from '../../FormValueProperty';
import { ObjectFormValueMapper } from '../../ObjectFormValueMapper';
import { DateTimeFormValue } from '../DateTimeFormValue';
import { ObjectFormValue } from '../ObjectFormValue';
import { DynamicFieldFormValueCountHandler } from './DynamicFieldFormValueCountHandler';
import { ICountableFormValue } from './ICountableFromValue';

export class DynamicFieldDateTimeFormValue extends DateTimeFormValue implements ICountableFormValue {

    public dfValues: DynamicFieldValue[] = [];

    private bindingIds: string[] = [];

    public constructor(
        public property: string,
        protected object: DynamicFieldValue,
        public objectValueMapper: ObjectFormValueMapper,
        public parent: ObjectFormValue,
        public dfName: string
    ) {
        super(property, object, objectValueMapper, parent);
        this.inputComponentId = 'datetime-form-input';
        this.addBindings();
    }

    public destroy(): void {
        this.removePropertyBinding(this.bindingIds);
    }

    public findFormValue(property: string): ObjectFormValue {
        if (property === this.dfName) {
            return this;
        }

        return super.findFormValue(property);
    }

    public async initFormValue(): Promise<void> {
        await super.initFormValue();

        const dynamicField = await KIXObjectService.loadDynamicField(this.dfName);

        if (dynamicField.FieldType === DynamicFieldTypes.DATE) {
            this.inputType = InputFieldTypes.DATE;
        } else if (dynamicField.FieldType === DynamicFieldTypes.DATE_TIME) {
            this.inputType === InputFieldTypes.DATE_TIME;
        }

        const config = dynamicField.Config;

        this.countDefault = Number(config?.CountDefault) || 0;
        this.countMax = Number(config?.CountMax) || 0;
        this.countMin = Number(config?.CountMin) || 0;
        this.setDateConfiguration(config);

        this.value = this.object[this.property];
    }

    private setDateConfiguration(config: any): void {
        switch (config?.DateRestriction) {
            case 'DisablePastDates':
                this.setDatesLimit(config, true, false);
                break;
            case 'DisableFutureDates':
                this.setDatesLimit(config, false, true);
                break;
            case 'none':
            default:
                this.setDatesLimit(config);
        }

        const isDefaultValueDefined = config?.DefaultValue !== ''
            && config?.DefaultValue !== null
            && typeof config?.DefaultValue !== 'undefined';

        let offset = null;
        if (isDefaultValueDefined) {
            offset = Number(config?.DefaultValue) >= 0 ? Number(config?.DefaultValue) : null;
        }

        if (!this.value && offset !== null && !this.isEmpty) {
            const date = new Date();
            date.setSeconds(date.getSeconds() + offset);
            this.value = DateTimeUtil.getKIXDateTimeString(date);
        }
    }

    private setDatesLimit(config: any, disablePast = false, disableFuture = false): void {
        if (disablePast) {
            this.minDate = new Date().toISOString();
        } else if (this.parseYearsToInt(config?.YearsInPast)) {
            this.minDate = this.calculateDate(config?.YearsInPast);
        }

        if (disableFuture) {
            this.maxDate = new Date().toISOString();
        } else if (this.parseYearsToInt(config?.YearsInFuture)) {
            this.maxDate = this.calculateDate(config?.YearsInFuture, true);
        }
    }


    private calculateDate(years: string, add: boolean = false): string {
        const date = new Date();
        const numOfYears = this.parseYearsToInt(years);

        if (add) {
            date.setFullYear(date.getFullYear() + numOfYears);
        } else {
            date.setFullYear(date.getFullYear() - numOfYears);
        }

        return date.toISOString();
    }

    private parseYearsToInt(year: string): number {
        let number;
        try {
            number = Number.parseInt(year);
        }
        catch (e) {
            number = 0;
        }
        return number;
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
        this.bindingIds.push(
            this.addPropertyBinding(FormValueProperty.COUNT_MAX, (value: ObjectFormValue) => this._countMax()),
            this.addPropertyBinding(FormValueProperty.ENABLED, async (value: ObjectFormValue) => {
                if (this.enabled) {
                    await this.initCountValues();
                }
            })
        );
    }

    public async setFormValue(value: any, force?: boolean): Promise<void> {
        if (this.isCountHandler) {
            await DynamicFieldFormValueCountHandler.setFormValue(value, force, this, this.instanceId);
        } else {
            await super.setFormValue(value, force);
        }
    }

}