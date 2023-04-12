/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../../../modules/base-components/webapp/core/AbstractAction';
import { UIComponentPermission } from '../../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../../server/model/rest/CRUD';
import { OrganisationDialogUtil } from '../OrganisationDialogUtil';

export class OrganisationCreateAction extends AbstractAction {

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('organisations', [CRUD.CREATE])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#New Organisation';
        this.icon = 'kix-icon-man-house-new';
    }

    public async run(event: any): Promise<void> {
        OrganisationDialogUtil.create();
    }

}
