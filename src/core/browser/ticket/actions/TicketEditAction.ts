/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../model/components/action/AbstractAction';
import { Ticket, CRUD } from '../../../model';
import { UIComponentPermission } from '../../../model/UIComponentPermission';
import { TicketDialogUtil } from '../TicketDialogUtil';

export class TicketEditAction extends AbstractAction<Ticket> {

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('tickets/*', [CRUD.UPDATE])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Edit';
        this.icon = "kix-icon-edit";
    }

    public async run(): Promise<void> {
        TicketDialogUtil.editTicket();
    }

}
