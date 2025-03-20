/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { TicketUIEvent } from '../../../model/TicketUIEvent';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.cell = input.cell;
        if (this.state.cell) {
            const value = this.state.cell.getValue().objectValue;
            this.state.isActive = value !== undefined && value !== null && value !== 0;
        }
    }

    public goToArticleClicked(event: any): void {
        event.stopPropagation();
        event.preventDefault();

        EventService.getInstance().publish(
            TicketUIEvent.SCROLL_TO_ARTICLE, { articleId: this.state.cell.getValue().objectValue }
        );
    }

}

module.exports = Component;
