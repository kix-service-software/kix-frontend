/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { EditLinkedObjectsDialogContext } from '../context';
import { AbstractAction } from '../../../../../modules/base-components/webapp/core/AbstractAction';
import { UIComponentPermission } from '../../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../../server/model/rest/CRUD';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';

export class LinkedObjectsEditAction extends AbstractAction {

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('links', [CRUD.READ, CRUD.CREATE], true),
        new UIComponentPermission('links', [CRUD.READ, CRUD.DELETE], true)
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Edit Links';
        this.icon = 'kix-icon-link';
    }

    public async run(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        await ContextService.getInstance().setActiveContext(
            EditLinkedObjectsDialogContext.CONTEXT_ID, context?.getObjectId()
        );
    }
}
