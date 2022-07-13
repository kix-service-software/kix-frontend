/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IdService } from '../../../../../model/IdService';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
import { ValidationResult } from '../../../../base-components/webapp/core/ValidationResult';
import { ObjectFormValue } from '../../../model/FormValues/ObjectFormValue';
import { ObjectFormEvent } from '../../../model/ObjectFormEvent';
import { ObjectFormValueMapper } from '../../../model/ObjectFormValueMapper';
import { ObjectFormRegistry } from '../ObjectFormRegistry';
import { ObjectFormValueValidator } from './ObjectFormValueValidator';

export class ObjectFormValidator {

    private validators: ObjectFormValueValidator[];
    private subscriber: IEventSubscriber;

    public enabled: boolean = true;

    public constructor(private objectFormValueMapper: ObjectFormValueMapper) {
        this.validators = ObjectFormRegistry.getInstance().createValidators();
        this.initValidator();
    }

    public destroy(): void {
        EventService.getInstance().unsubscribe(ObjectFormEvent.OBJECT_FORM_VALUE_CHANGED, this.subscriber);
    }

    private initValidator(): void {

        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId('ObjectFormValidator'),
            eventPublished: (data, eventId, subscriberId?): void => {
                this.validate(data);
            }
        };
        EventService.getInstance().subscribe(ObjectFormEvent.OBJECT_FORM_VALUE_CHANGED, this.subscriber);
    }

    public async validateForm(): Promise<boolean> {
        if (this.enabled && this.objectFormValueMapper?.initialized) {
            await this.validateFormValues(this.objectFormValueMapper?.getFormValues());
            return this.isFormValid(this.objectFormValueMapper?.getFormValues());
        }
    }

    private async validateFormValues(formValues: ObjectFormValue[] = []): Promise<void> {
        const validationPromises: Array<Promise<void>> = [];
        for (const fv of formValues) {
            validationPromises.push(this.validate(fv));

            if (Array.isArray(fv.formValues) && fv.formValues.length) {
                validationPromises.push(this.validateFormValues(fv.formValues));
            }
        }

        await Promise.all(validationPromises);
    }

    public async validate(formValue: ObjectFormValue, force?: boolean): Promise<void> {
        if ((this.enabled || force) && this.objectFormValueMapper?.initialized && !formValue?.isCountHandler) {
            const result: ValidationResult[] = [];
            if (formValue.enabled) {
                for (const validator of this.validators) {
                    const validationResult = await validator.validate(formValue);
                    result.push(...validationResult);
                }
            }
            formValue.setValidationResult(result);
        }
    }

    public isFormValid(formValues: ObjectFormValue[]): boolean {
        for (const fv of formValues) {
            if (!fv.valid) {
                return false;
            }

            if (fv.formValues?.length) {
                const valid = this.isFormValid(fv.formValues);
                if (!valid) {
                    return false;
                }
            }
        }

        return true;
    }

}