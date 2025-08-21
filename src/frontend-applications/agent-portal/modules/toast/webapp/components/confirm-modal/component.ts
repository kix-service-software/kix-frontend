/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ModalSettings } from '../../../model/ModalSettings';
import { AgentService } from '../../../../user/webapp/core/AgentService';
import { BrowserUtil } from '../../../../base-components/webapp/core/BrowserUtil';

declare const bootstrap: any;

class Component {

    private state: ComponentState;
    private settings: ModalSettings;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: ModalSettings): void {
        this.settings = input;
    }

    public async onMount(): Promise<void> {
        this.state.okLabel = this.settings?.okLabel || 'Translatable#OK';
        this.state.cancelLabel = this.settings?.cancelLabel || 'Translatable#OK';
        this.state.title = this.settings.title || 'Sure?';
        this.state.confirmText = this.settings?.confirmText || '';
        this.state.decisionLabel = this.settings?.decisionTitle;

        if (this.settings?.decisionPreference) {
            const preference = await AgentService.getInstance().getUserPreference(this.settings?.decisionPreference);
            this.state.decisionChecked = BrowserUtil.isBooleanTrue(preference?.Value);
        }
    }

    public decisionChanged(event: any): void {
        this.state.decisionChecked = !this.state.decisionChecked;
        AgentService.getInstance().setPreferences([[this.settings?.decisionPreference, this.state.decisionChecked]]);
    }

    public submit(): void {
        if (this.settings?.confirmCallback) {
            this.settings?.confirmCallback();
        }
    }

    public cancel(): void {
        if (this.settings?.cancelCallback) {
            this.settings?.cancelCallback();
        }
    }

}

module.exports = Component;
