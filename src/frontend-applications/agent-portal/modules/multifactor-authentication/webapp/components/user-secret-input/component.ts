/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormInputComponent } from '../../../../base-components/webapp/core/FormInputComponent';
import { ApplicationEvent } from '../../../../base-components/webapp/core/ApplicationEvent';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { UserProperty } from '../../../../user/model/UserProperty';
import { ComponentState } from './ComponentState';
import { MFAService } from '../../core/MFAService';

class Component extends FormInputComponent<string, ComponentState> {

    private userId: number;
    private secretPreference: string;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        const userIdOption = this.state.field?.options?.find((o) => o.option === UserProperty.USER_ID);
        this.userId = userIdOption?.value;

        const secretPropertyOption = this.state.field?.options?.find((o) => o.option === 'SecretProperty');
        this.secretPreference = secretPropertyOption?.value;

        this.setCurrentValue();
    }

    public async generateNewSecret(event: any): Promise<void> {
        event.stopPropagation();
        event.preventDefault();

        const hint = await TranslationService.translate('Translatable#Generate new user secret');
        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: true, hint });

        await MFAService.getInstance().generateTOTPSecret(this.userId, this.secretPreference);
        await this.setCurrentValue();

        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false, hint: '' });
    }

    public async setCurrentValue(): Promise<void> {
        this.state.currentValue = await MFAService.getInstance().getTOTPSecret(this.userId, this.secretPreference);
        (this as any).setStateDirty('currentValue');
    }

}

module.exports = Component;
