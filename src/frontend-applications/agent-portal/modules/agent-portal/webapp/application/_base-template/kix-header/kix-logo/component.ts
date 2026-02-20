/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../../../base-components/webapp/core/AbstractMarkoComponent';
import { ComponentState } from './ComponentState';
import { ObjectIconService } from '../../../../../../icon/webapp/core';

class Component extends AbstractMarkoComponent<ComponentState> {

    public state: ComponentState;

    public onCreate(input: any): void {
        super.onCreate(input);
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        const objectIcon = await ObjectIconService.getInstance().getObjectIcon('agent-portal-logo', 'agent-portal-logo');
        if (objectIcon) {
            if (objectIcon.ContentType === 'text') {
                this.state.logoSrcPath = null;
            }
            else {
                this.state.logoSrcPath = await ObjectIconService.getObjectIconUrl(
                    objectIcon.ID, objectIcon.ContentType
                );
            }
        }
    }

    public onDestroy(): void {
        super.onDestroy();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }
}

module.exports = Component;
