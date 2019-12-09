/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import {
    AbstractMarkoComponent
} from '../../../../../frontend-applications/agent-portal/modules/base-components/webapp/core/AbstractMarkoComponent';
import {
    ContextService
} from '../../../../../frontend-applications/agent-portal/modules/base-components/webapp/core/ContextService';
import { ChatRoomContext } from '../../core';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        const context = await ContextService.getInstance().getContext<ChatRoomContext>(
            ChatRoomContext.CONTEXT_ID
        );

        if (context) {
            this.state.widgets = context.getContent();
        }
    }

}

module.exports = Component;
