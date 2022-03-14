/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { Cell } from '../../../../table/model/Cell';
import { Contact } from '../../../model/Contact';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { NewTicketDialogContext, TicketDialogUtil } from '../../../../ticket/webapp/core';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        if (input.cell) {
            const cell: Cell = input.cell;
            this.state.contact = cell.getRow().getRowObject().getObject();
            this.update(this.state.contact);

        }
    }

    private async update(contact: Contact): Promise<void> {
        this.state.show = contact &&
            contact instanceof Contact &&
            ContextService.getInstance().hasContextDescriptor(NewTicketDialogContext.CONTEXT_ID);
    }

    public labelClicked(event: any): void {
        event.stopPropagation();
        event.preventDefault();
        TicketDialogUtil.createTicket(null, null, null, null, [[KIXObjectType.CONTACT, this.state.contact as any]]);
    }

}

module.exports = Component;
