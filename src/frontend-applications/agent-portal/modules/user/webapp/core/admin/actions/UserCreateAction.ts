/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from "../../../../../../modules/base-components/webapp/core/AbstractAction";
import { ContextService } from "../../../../../../modules/base-components/webapp/core/ContextService";
import { KIXObjectType } from "../../../../../../model/kix/KIXObjectType";
import { ContextMode } from "../../../../../../model/ContextMode";
import { NewContactDialogContext } from "../../../../../customer/webapp/core";
import { UIComponentPermission } from "../../../../../../model/UIComponentPermission";
import { CRUD } from "../../../../../../../../server/model/rest/CRUD";

export class UserCreateAction extends AbstractAction {

    public permissions = [
        new UIComponentPermission('contacts', [CRUD.CREATE]),
        new UIComponentPermission('system/users', [CRUD.CREATE]),
        new UIComponentPermission('system/users/*', [CRUD.UPDATE])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#New User';
        this.icon = 'kix-icon-new-gear';
    }

    public async run(event: any): Promise<void> {
        const context = await ContextService.getInstance().getContext(NewContactDialogContext.CONTEXT_ID);
        if (context) {
            context.reset();
            context.setAdditionalInformation('IS_AGENT_DIALOG', true);
        }
        ContextService.getInstance().setDialogContext(
            // TODO: Titel aus dem aktiven Admin-Modul ermitteln (Kategorie)
            NewContactDialogContext.CONTEXT_ID, KIXObjectType.CONTACT, ContextMode.CREATE, null, false,
            'Translatable#User Management', true
        );
    }

}
