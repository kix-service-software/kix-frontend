/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
import { ObjectFormValueMapper } from '../../ObjectFormValueMapper';
import { DateTimeFormValue } from '../DateTimeFormValue';
import { ObjectFormValue } from '../ObjectFormValue';

export class DynamicFieldDateTimeFormValue extends DateTimeFormValue {


    public constructor(
        public property: string,
        protected object: DynamicFieldValue,
        public objectValueMapper: ObjectFormValueMapper,
        public parent: ObjectFormValue,
        public dfName: string
    ) {
        super(property, object, objectValueMapper, parent);
        this.inputComponentId = 'datetime-form-input';
    }

    public findFormValue(property: string): ObjectFormValue {
        if (property === this.dfName) {
            return this;
        }

        return super.findFormValue(property);
    }

    public async initFormValue(): Promise<void> {
        await super.initFormValue();
        await this.setDateConfiguration();
    }

    private async getDynamicFieldConfig(): Promise<any> {
        const dynamicField = await KIXObjectService.loadDynamicField(this.dfName);

        if (dynamicField.FieldType === DynamicFieldTypes.DATE) {
            this.inputType = InputFieldTypes.DATE;
        } else if (dynamicField.FieldType === DynamicFieldTypes.DATE_TIME) {
            this.inputType === InputFieldTypes.DATE_TIME;
        }

        return dynamicField.Config;
    }

    private async setDateConfiguration(): Promise<void> {
        const config = await this.getDynamicFieldConfig();

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
            this.value = this.getOffsetValue(offset);
        }
    }

    private setDatesLimit(config: any, disablePast = false, disableFuture = false): void {
        if (disablePast) {
            const date = new Date();
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            this.minDate = DateTimeUtil.getKIXDateTimeString(date);
        } else if (this.parseYearsToInt(config?.YearsInPast)) {
            this.minDate = this.calculateDate(config?.YearsInPast);
        }

        if (disableFuture) {
            this.maxDate = DateTimeUtil.getKIXDateTimeString(new Date());
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

    public async setFormValue(value: any, force?: boolean): Promise<void> {
        value = DateTimeUtil.calculateRelativeDate(value);
        await super.setFormValue(value, force);
    }

    protected getOffsetValue(offset: number): string {
        const date = new Date();
        date.setSeconds(date.getSeconds() + offset);
        return DateTimeUtil.getKIXDateTimeString(date);
    }
}