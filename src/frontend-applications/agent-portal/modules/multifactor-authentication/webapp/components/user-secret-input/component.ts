/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ApplicationEvent } from '../../../../base-components/webapp/core/ApplicationEvent';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { UserProperty } from '../../../../user/model/UserProperty';
import { ComponentState } from './ComponentState';
import { MFAService } from '../../core/MFAService';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { ObjectFormValue } from '../../../../object-forms/model/FormValues/ObjectFormValue';
import { FormValueProperty } from '../../../../object-forms/model/FormValueProperty';
import { Contact } from '../../../../customer/model/Contact';

class Component extends AbstractMarkoComponent<ComponentState> {

    private bindingIds: string[];
    private formValue: ObjectFormValue;

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

    private async update(): Promise<void> {
        this.bindingIds = [];

        this.bindingIds.push(
            this.formValue?.addPropertyBinding(
                FormValueProperty.VALUE, async (formValue: ObjectFormValue) => {
                    this.state.currentValue = formValue.value;
                }
            )
        );
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.state.currentValue = this.formValue?.value;
    }

    public async generateNewSecret(event: any): Promise<void> {
        event.stopPropagation();
        event.preventDefault();

        const hint = await TranslationService.translate('Translatable#Generate new user secret');
        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: true, hint });

        const userId = (this.formValue.objectValueMapper.object as Contact)?.User?.UserID;

        await MFAService.getInstance().generateTOTPSecret(userId, this.formValue['secretPreference']);
        await this.setCurrentValue();

        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false, hint: '' });
    }

    public async setCurrentValue(): Promise<void> {
        const userId = (this.formValue.objectValueMapper.object as Contact)?.User?.UserID;
        this.state.currentValue = await MFAService.getInstance().getTOTPSecret(userId, this.formValue['secretPreference']);
        this.formValue.setFormValue(this.state.currentValue);
    }

}

module.exports = Component;
