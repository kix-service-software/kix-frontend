/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { FormInputComponent } from '../../../../../modules/base-components/webapp/core/FormInputComponent';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { ApplicationEvent } from '../../../../base-components/webapp/core/ApplicationEvent';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { UserProperty } from '../../../model/UserProperty';
import { AgentService } from '../../core/AgentService';
import { PersonalSettingsProperty } from '../../../model/PersonalSettingsProperty';
import { User } from '../../../model/User';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';

class Component extends FormInputComponent<string, ComponentState> {

    private userId: number;

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

        this.setCurrentValue();
    }

    public async generateNewToken(event: any): Promise<void> {
        event.stopPropagation();
        event.preventDefault();

        const hint = await TranslationService.translate('Translatable#Generate new user token');
        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: true, hint });

        const objectType = this.userId ? KIXObjectType.USER : KIXObjectType.CURRENT_USER;
        await KIXObjectService.updateObject(objectType, [[UserProperty.EXEC_GENRATE_TOKEN, 1]], this.userId)
            .catch(() => null);
        this.setCurrentValue();

        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false, hint: '' });
    }

    public async setCurrentValue(): Promise<void> {
        if (this.userId) {
            const loadingOptions = new KIXObjectLoadingOptions();
            loadingOptions.includes = [UserProperty.PREFERENCES];
            const users = await KIXObjectService.loadObjects<User>(KIXObjectType.USER, [this.userId], loadingOptions)
                .catch((): User[] => []);
            if (Array.isArray(users) && users.length) {
                const tokenPref = users[0].Preferences.find((p) => p.ID === PersonalSettingsProperty.USER_TOKEN);
                this.state.currentValue = tokenPref?.Value;
            }
        } else {
            const tokenPreference = await AgentService.getInstance().getUserPreference(
                PersonalSettingsProperty.USER_TOKEN
            );
            this.state.currentValue = tokenPreference?.Value;
        }
    }

}

module.exports = Component;
