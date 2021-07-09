/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { Cell } from '../../../../base-components/webapp/core/table';
import { Contact } from '../../../model/Contact';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { NewTicketDialogContext } from '../../../../ticket/webapp/core';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        if (input.cell) {
            const cell: Cell = input.cell;
            const contact: Contact = cell.getRow().getRowObject().getObject();
            this.update(contact);

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
        ContextService.getInstance().setActiveContext(NewTicketDialogContext.CONTEXT_ID);
    }

}

module.exports = Component;
