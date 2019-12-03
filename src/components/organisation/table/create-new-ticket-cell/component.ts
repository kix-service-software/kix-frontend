/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent, ContextService, ICell, DialogService } from '../../../../core/browser';
import { KIXObjectType, ContextMode, Contact } from '../../../../core/model';
import { ContextFactory } from '../../../../core/browser/context/ContextFactory';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        if (input.cell) {
            const cell: ICell = input.cell;
            const contact: Contact = cell.getRow().getRowObject().getObject();
            this.update(contact);
        }
    }

    private async update(contact: Contact): Promise<void> {
        if (contact && contact instanceof Contact) {
            const dialogs = ContextFactory.getInstance().getContextDescriptors(
                ContextMode.CREATE, KIXObjectType.TICKET
            );
            this.state.show = contact.ValidID === 1 && dialogs && dialogs.length > 0;
        }
    }

    public labelClicked(event: any): void {
        event.stopPropagation();
        event.preventDefault();
        ContextService.getInstance().setDialogContext(null, KIXObjectType.TICKET, ContextMode.CREATE, null, true);
    }

}

module.exports = Component;
