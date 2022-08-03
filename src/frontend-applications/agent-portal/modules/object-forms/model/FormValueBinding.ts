/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { BindableObject } from '../../../model/BindableObject';
import { IdService } from '../../../model/IdService';
import { EventService } from '../../base-components/webapp/core/EventService';
import { FormValueProperty } from './FormValueProperty';
import { ObjectFormValue } from './FormValues/ObjectFormValue';
import { ObjectFormEvent } from './ObjectFormEvent';

export class FormValueBinding {

    public id: string;

    private elementBindings = [];
    private value: any;

    public constructor(
        private formValue: ObjectFormValue, public property: string,
        object: BindableObject, objectProperty: string
    ) {
        this.id = IdService.generateDateBasedId('FormValueBinding');
        this.value = formValue[property];

        Object.defineProperty(this.formValue, this.property, {
            get: this.valueGetter.bind(this),
            set: this.valueSetter.bind(this)
        });

        if (property === FormValueProperty.VALUE) {
            // FIXME: currently not active because of circle (form => object => form => object ...)
            // object.addBinding(objectProperty, (value: any): void => {
            //     this.value = value;
            //     formValue.setFormValue(value);
            // });
        }
    }

    public destroy(): void {
        return;
    }

    private valueGetter(): any {
        return this.value;
    }

    private async valueSetter(val: any): Promise<void> {
        this.value = val;

        if (this.property === FormValueProperty.VALUE) {
            await this.formValue.setObjectValue(val);
            EventService.getInstance().publish(
                ObjectFormEvent.OBJECT_FORM_VALUE_CHANGED, this.formValue);
        }

        for (const binding of this.elementBindings) {
            if (binding.cb) {
                binding.cb(this.formValue);
            }
        }
    }

    public addBinding(cb: (value: ObjectFormValue) => void): string {
        const binding = {
            id: IdService.generateDateBasedId(),
            cb
        };
        this.elementBindings.push(binding);

        return binding.id;
    }

    public removeBindings(bindingIds: string[]): void {
        for (const id of bindingIds) {
            const index = this.elementBindings.findIndex((b) => b.id === id);
            if (index !== -1) {
                this.elementBindings.splice(index, 1);
            }
        }
    }

}