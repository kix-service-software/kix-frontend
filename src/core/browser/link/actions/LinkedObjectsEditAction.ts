/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction, KIXObjectType, ContextMode, CRUD } from '../../../model';
import { ContextService } from '../../context';
import { EditLinkedObjectsDialogContext } from '../context';
import { UIComponentPermission } from '../../../model/UIComponentPermission';

export class LinkedObjectsEditAction extends AbstractAction {

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('links', [CRUD.READ, CRUD.CREATE], true),
        new UIComponentPermission('links', [CRUD.READ, CRUD.DELETE], true)
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Links';
        this.icon = 'kix-icon-link';
    }

    public async run(): Promise<void> {
        await ContextService.getInstance().setDialogContext(
            EditLinkedObjectsDialogContext.CONTEXT_ID,
            KIXObjectType.LINK,
            ContextMode.EDIT_LINKS
        );
    }
}
