/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../model/components/action/AbstractAction';
import { UIComponentPermission } from '../../../model/UIComponentPermission';
import { CRUD, KIXObjectType, ContextMode } from '../../../model';
import { ContextService } from '../../context';

export class OrganisationSearchAction extends AbstractAction {

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('organisations', [CRUD.READ])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Search';
        this.icon = 'kix-icon-search';
    }

    public async run(event: any): Promise<void> {
        ContextService.getInstance().setDialogContext(null, KIXObjectType.ORGANISATION, ContextMode.SEARCH, null, true);
    }

}
