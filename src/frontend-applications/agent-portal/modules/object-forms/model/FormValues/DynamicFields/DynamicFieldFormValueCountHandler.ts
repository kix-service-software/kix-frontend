/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { DynamicFieldValue } from '../../../../dynamic-fields/model/DynamicFieldValue';
import { FormValueProperty } from '../../FormValueProperty';
import { DynamicFieldObjectFormValue } from '../DynamicFieldObjectFormValue';
import { ObjectFormValue } from '../ObjectFormValue';

export class DynamicFieldFormValueCountHandler {

    public static canAddValue(formValue: ObjectFormValue, instanceId: string): boolean {
        let canAdd = false;

        if (formValue.isCountHandler) {
            const index = formValue.formValues.findIndex((fv) => fv.instanceId === instanceId);

            const length = (formValue as any).dfValues?.length || 0;
            const countMax = formValue.countMax;
            const countMin = formValue.countMin;
            canAdd = ((countMax > countMin) && countMax > 0 && length < countMax) || countMax === 0;
            canAdd = canAdd && (index === formValue.formValues.length - 1 || formValue.instanceId === instanceId);

        } else {
            canAdd = formValue.parent.canAddValue(instanceId);
        }

        return canAdd;
    }

    public static async addFormValue(
        formValue: ObjectFormValue, instanceId: string, value: any
    ): Promise<void> {
        if (formValue.isCountHandler) {
            const dfValue = new DynamicFieldValue();
            dfValue.Value = value;
            dfValue.Name = (formValue as any).dfName;
            (formValue as any).dfValues.push(dfValue);

            const parent = formValue.parent as DynamicFieldObjectFormValue;
            const fv = await parent.createFormValue((formValue as any).dfName, dfValue, false);
            fv.parent = formValue;
            fv.enabled = formValue.enabled;
            fv.visible = true;
            fv.isSortable = false;
            fv.readonly = formValue.readonly;
            fv.required = formValue.required;
            await fv.initFormValue();
            formValue.formValues = [...formValue.formValues, fv];

            fv.addPropertyBinding(FormValueProperty.VALUE, () => {
                (formValue as any).setDFValue();
            });

            (formValue as any).setDFValue();
        } else {
            await formValue.parent.addFormValue(instanceId, value);
        }
    }

    public static canRemoveValue(formValue: ObjectFormValue, instanceId: string): boolean {
        let canRemove = false;

        if (formValue.isCountHandler) {
            const length = (formValue as any).dfValues?.length || 0;
            const countMin = formValue.countMin || 0;
            canRemove = length > countMin && countMin >= 0 && formValue.instanceId !== instanceId;
        } else {
            canRemove = formValue.parent.canRemoveValue(instanceId);
        }

        return canRemove;
    }

    public static async removeFormValue(formValue: ObjectFormValue, instanceId: string): Promise<void> {
        if (formValue.isCountHandler) {
            const index = formValue.formValues.findIndex((fv) => fv.instanceId === instanceId);
            if (index !== -1) {
                formValue.formValues[index].destroy();
                formValue.formValues.splice(index, 1);
                formValue.formValues = [...formValue.formValues];
                (formValue as any).dfValues.splice(index, 1);
            }


            (formValue as any).setDFValue();
        } else {
            await formValue.parent.removeFormValue(instanceId);
        }
    }

    public static setDFValue(formValue: ObjectFormValue, cb?: (value: any) => Promise<void>): void {
        const value = [];
        const dfValues = (formValue as any).dfValues;
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

        if (cb) {
            cb(value);
        } else {
            formValue.setFormValue(value);
        }
    }

    public static async setFormValue(
        value: any, force: boolean, formValue: ObjectFormValue, instanceId: string
    ): Promise<void> {
        if (formValue.isCountHandler) {
            if (formValue.canAddValue(formValue.instanceId)) {
                await formValue.addFormValue(formValue.instanceId, value);
            } else {
                formValue.formValues[formValue.formValues.length - 1]?.setFormValue(value, force);
            }
        }
    }

}