/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IdService } from '../../../../../../model/IdService';
import { AbstractMarkoComponent } from '../../../../../base-components/webapp/core/AbstractMarkoComponent';
import { BrowserUtil } from '../../../../../base-components/webapp/core/BrowserUtil';
import { EventService } from '../../../../../base-components/webapp/core/EventService';
import { IEventSubscriber } from '../../../../../base-components/webapp/core/IEventSubscriber';
import { KIXModulesService } from '../../../../../base-components/webapp/core/KIXModulesService';
import { ValidationSeverity } from '../../../../../base-components/webapp/core/ValidationSeverity';
import { TranslationService } from '../../../../../translation/webapp/core/TranslationService';
import { FormValueProperty } from '../../../../model/FormValueProperty';
import { ObjectFormValue } from '../../../../model/FormValues/ObjectFormValue';
import { ObjectFormEvent } from '../../../../model/ObjectFormEvent';
import { ComponentState } from './ComponentState';

export class Component extends AbstractMarkoComponent<ComponentState> {

    private bindingIds: string[];
    private subscriber: IEventSubscriber;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        if (this.state.formValue?.instanceId !== input.formValue?.instanceId) {
            this.state.formValue?.removePropertyBinding(this.bindingIds);

            this.state.formValue = input.formValue;

            this.update();

            if (this.state.formValue?.inputComponentId) {
                this.state.inputTemplate = KIXModulesService.getComponentTemplate(
                    this.state.formValue?.inputComponentId
                );
            }
        } else {
            this.setButtonsAndVisibility();
        }
    }

    private async update(): Promise<void> {
        this.bindingIds = [];

        this.bindingIds.push(
            this.state.formValue?.addPropertyBinding(
                FormValueProperty.FORM_VALUES, (formValue: ObjectFormValue) => {
                    this.state.formValues = [...formValue.formValues];
                }
            )
        );

        this.bindingIds.push(
            this.state.formValue?.addPropertyBinding(
                FormValueProperty.VALUE, (formValue: ObjectFormValue) => {
                    this.state.formValues = [...formValue.formValues];
                }
            )
        );

        this.bindingIds.push(
            this.state.formValue?.addPropertyBinding(
                FormValueProperty.VALID, (formValue: ObjectFormValue) => {
                    this.state.valid = formValue.valid;
                }
            )
        );

        this.bindingIds.push(
            this.state.formValue?.addPropertyBinding(
                FormValueProperty.VALIDATION_RESULTS, (formValue: ObjectFormValue) => {
                    this.state.validationErrors = formValue.validationResults.filter(
                        (vr) => vr.severity === ValidationSeverity.ERROR
                    );
                }
            )
        );

        this.bindingIds.push(
            this.state.formValue?.addPropertyBinding(
                FormValueProperty.READ_ONLY, (formValue: ObjectFormValue) => {
                    this.state.readonly = formValue.readonly;
                }
            )
        );

        this.bindingIds.push(
            this.state.formValue?.addPropertyBinding(
                FormValueProperty.REQUIRED, (formValue: ObjectFormValue) => {
                    this.state.required = formValue.required;
                }
            )
        );

        this.bindingIds.push(
            this.state.formValue?.addPropertyBinding(
                FormValueProperty.VISIBLE, (formValue: ObjectFormValue) => {
                    this.state.visible = formValue.visible;
                }
            )
        );

        this.bindingIds.push(
            this.state.formValue?.addPropertyBinding(
                FormValueProperty.ENABLED, (formValue: ObjectFormValue) => {
                    this.state.enabled = formValue.enabled;
                }
            )
        );

        this.state.enabled = this.state.formValue?.enabled;
        this.state.visible = this.state.formValue?.visible;
        this.state.valid = this.state.formValue?.valid;
        this.state.readonly = this.state.formValue?.readonly;
        this.state.required = this.state.formValue?.required;
        this.state.hint = this.state.formValue?.hint;
        this.state.formValues = this.state.formValue?.formValues;
        this.state.label = await TranslationService.translate(this.state.formValue?.label);
        await this.setButtonsAndVisibility();

        this.state.validationErrors = this.state.formValue.validationResults.filter(
            (vr) => vr.severity === ValidationSeverity.ERROR
        );
    }

    public async onMount(): Promise<void> {

        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId(this.state.formValue?.instanceId),
            eventPublished: (instanceId: string): void => {
                if (this.state.formValue?.instanceId === instanceId) {
                    const element = (this as any).getEl();
                    if (element) {
                        BrowserUtil.scrollIntoViewIfNeeded(element);
                    }
                }
            }
        };
        EventService.getInstance().subscribe(ObjectFormEvent.SCROLL_TO_FORM_VALUE, this.subscriber);

        this.state.prepared = true;
    }

    public onDestroy(): void {
        this.state.formValue?.removePropertyBinding(this.bindingIds);
        EventService.getInstance().unsubscribe(ObjectFormEvent.SCROLL_TO_FORM_VALUE, this.subscriber);
    }

    public setCanAdd(): void {
        this.state.canAdd = this.state.formValue?.canAddValue(this.state.formValue.instanceId);
    }

    public async addValue(): Promise<void> {
        await this.state.formValue?.addFormValue(this.state.formValue.instanceId, null);
        this.setButtonsAndVisibility();
        (this as any).setStateDirty();
    }

    public setCanRemove(): void {
        this.state.canRemove = this.state.formValue?.canRemoveValue(this.state.formValue.instanceId);
    }

    public async removeValue(): Promise<void> {
        await this.state.formValue?.removeFormValue(this.state.formValue.instanceId);
        (this as any).setStateDirty();
    }

    private async setButtonsAndVisibility(): Promise<void> {
        await this.state.formValue.setVisibilityAndComponent();
        this.setCanAdd();
        this.setCanRemove();
    }


}

module.exports = Component;