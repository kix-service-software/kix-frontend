/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { TranslationService } from '../../../../../translation/webapp/core/TranslationService';
import { ContextService } from '../../../../../base-components/webapp/core/ContextService';
import { WindowListener } from '../../../../../base-components/webapp/core/WindowListener';
import { KIXStyle } from '../../../../../base-components/model/KIXStyle';
import { AbstractMarkoComponent } from '../../../../../base-components/webapp/core/AbstractMarkoComponent';

class Component extends AbstractMarkoComponent<ComponentState> {

    public state: ComponentState;

    public onCreate(input: any): void {
        super.onCreate(input);
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Personal Settings', 'Translatable#Switch to customer portal.',
            'Translatable#Help', 'Translatable#Logout'
        ]);

        window.addEventListener('resize', this.resizeHandling.bind(this), false);
        this.resizeHandling();
    }


    public onDestroy(): void {
        window.removeEventListener('resize', this.resizeHandling.bind(this), false);
    }

    private resizeHandling(): void {
        this.state.isMobile = Boolean(window.innerWidth <= KIXStyle.MOBILE_BREAKPOINT);
    }

    public showPersonalSettings(): void {
        ContextService.getInstance().setActiveContext('personal-settings-dialog-context');
    }

    public showHelp(): void {
        ContextService.getInstance().setActiveContext('release');
    }

    public async logout(): Promise<void> {
        WindowListener.getInstance().logout();
    }


    public onInput(input: any): void {
        super.onInput(input);
    }
}

module.exports = Component;
