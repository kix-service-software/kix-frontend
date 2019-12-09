/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from "../../../../../modules/base-components/webapp/core/AbstractAction";
import { UIComponentPermission } from "../../../../../model/UIComponentPermission";
import { CRUD } from "../../../../../../../server/model/rest/CRUD";
import { ContextService } from "../../../../../modules/base-components/webapp/core/ContextService";
import { KIXObjectType } from "../../../../../model/kix/KIXObjectType";
import { ContextMode } from "../../../../../model/ContextMode";

export class JobCreateAction extends AbstractAction {

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('system/automation/jobs', [CRUD.CREATE])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#New Job';
        this.icon = 'kix-icon-new-gear';
    }

    public async run(event: any): Promise<void> {
        ContextService.getInstance().setDialogContext(
            // TODO: Titel aus dem aktiven Admin-Modul ermitteln (Kategorie)
            null, KIXObjectType.JOB, ContextMode.CREATE_ADMIN, null, true,
            'Translatable#Automation'
        );
    }

}
