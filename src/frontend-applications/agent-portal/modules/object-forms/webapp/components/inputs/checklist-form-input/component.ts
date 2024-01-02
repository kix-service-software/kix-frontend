/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IdService } from '../../../../../../model/IdService';
import { AbstractMarkoComponent } from '../../../../../base-components/webapp/core/AbstractMarkoComponent';
import { DynamicFieldFormUtil } from '../../../../../base-components/webapp/core/DynamicFieldFormUtil';
import { EventService } from '../../../../../base-components/webapp/core/EventService';
import { IEventSubscriber } from '../../../../../base-components/webapp/core/IEventSubscriber';
import { FormValueProperty } from '../../../../model/FormValueProperty';
import { DynamicFieldChecklistFormValue } from '../../../../model/FormValues/DynamicFields/DynamicFieldChecklistFormValue';
import { ObjectFormValue } from '../../../../model/FormValues/ObjectFormValue';
import { ObjectFormEvent } from '../../../../model/ObjectFormEvent';
import { ComponentState } from './ComponentState';

export class Component extends AbstractMarkoComponent<ComponentState> {

    private formValue: DynamicFieldChecklistFormValue;
    private bindingIds: string[];

    private subscriber: IEventSubscriber;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        if (this.formValue?.instanceId !== input.formValue?.instanceId) {
            this.formValue?.removePropertyBinding(this.bindingIds);
            this.formValue = input.formValue;
            this.update();
        }
    }

    public async onMount(): Promise<void> {
        this.state.value = this.formValue?.value;
        this.setProgressValues();
        this.state.prepared = true;

        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId(),
            eventPublished: (data: any, eventId: string): void => {
                if (data.blocked) {
                    this.state.readonly = true;
                } else {
                    this.state.readonly = this.formValue.readonly;
                }
            }
        };
        EventService.getInstance().subscribe(ObjectFormEvent.BLOCK_FORM, this.subscriber);
    }

    public onDestroy(): void {
        this.formValue?.removePropertyBinding(this.bindingIds);
        EventService.getInstance().unsubscribe(ObjectFormEvent.BLOCK_FORM, this.subscriber);
    }

    private async update(): Promise<void> {
        this.bindingIds = [];
        this.state.value = this.formValue?.value;

        this.bindingIds.push(
            this.formValue?.addPropertyBinding(
                FormValueProperty.VALUE, async (formValue: DynamicFieldChecklistFormValue) => {
                    this.setProgressValues();
                }
            )
        );

        this.bindingIds.push(
            this.formValue.addPropertyBinding(FormValueProperty.READ_ONLY, (formValue: ObjectFormValue) => {
                this.state.readonly = formValue.readonly;
            })
        );

        this.state.readonly = this.formValue?.readonly;

        this.setProgressValues();
    }

    public itemValueChanged(event: any): void {
        if (event.stopPropagation) {
            event.stopPropagation();
        }

        if (event.preventDefault) {
            event.preventDefault();
        }

        (this as any).setStateDirty('checklist');
        this.formValue.setFormValue(this.state.value);
        this.setProgressValues();
    }

    private setProgressValues(): void {
        const values = DynamicFieldFormUtil.getInstance().countValues(this.state.value);
        if (values[0] > 0) {
            this.state.progressValue = Math.round(values[0] / values[1] * 100);
        }
        this.state.progressText = `${values[0]}/${values[1]}`;
    }

}

module.exports = Component;