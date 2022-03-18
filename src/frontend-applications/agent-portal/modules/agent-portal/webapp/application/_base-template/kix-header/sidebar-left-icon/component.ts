/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
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

class Component {

    public state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        ContextService.getInstance().registerListener({
            constexServiceListenerId: 'sidebar-left-icon',
            contextChanged: async (contextId: string, changedContext: Context) => {
                const sidbebars = await changedContext?.getSidebarsLeft();
                this.state.hasSidebarsLeft = Boolean(sidbebars?.length);
            },
            contextRegistered: () => { return; }
        });

        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Open left sidebar'
        ]);

        const context: Context = ContextService.getInstance().getActiveContext();
        const sidbebars = await context?.getSidebarsLeft();
        this.state.hasSidebarsLeft = Boolean(sidbebars?.length);
    }

    public showMobileLeftSidebar(): void {
        EventService.getInstance().publish(MobileShowEvent.SHOW_MOBILE, MobileShowEventData.SHOW_LEFT_SIDEBAR);
    }
}

module.exports = Component;
