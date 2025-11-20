/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { EventService } from '../../../../../../base-components/webapp/core/EventService';
import { MobileShowEvent } from '../../../../../model/MobileShowEvent';
import { ContextService } from '../../../../../../base-components/webapp/core/ContextService';
import { Context } from '../../../../../../../model/Context';
import { TranslationService } from '../../../../../../translation/webapp/core/TranslationService';
import { MobileShowEventData } from '../../../../../model/MobileShowEventData';
import { AbstractMarkoComponent } from '../../../../../../base-components/webapp/core/AbstractMarkoComponent';

class Component extends AbstractMarkoComponent<ComponentState> {

    public state: ComponentState;

    public onCreate(input: any): void {
        super.onCreate(input);
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Open left sidebar'
        ]);

        const sidbebars = await this.context?.getSidebarsLeft();
        this.state.hasSidebarsLeft = Boolean(sidbebars?.length);
    }

    public onDestroy(): void {
        super.onDestroy();
    }

    public showMobileLeftSidebar(): void {
        EventService.getInstance().publish(MobileShowEvent.SHOW_MOBILE, MobileShowEventData.SHOW_LEFT_SIDEBAR);
    }

    public onInput(input: any): void {
        super.onInput(input);
    }
}

module.exports = Component;
