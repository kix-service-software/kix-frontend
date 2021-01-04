/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../../../modules/base-components/webapp/core/AbstractAction';
import { UIComponentPermission } from '../../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../../server/model/rest/CRUD';
import { TextModuleDialogUtil } from '../TextModuleDialogUtil';

export class TextModuleCreateAction extends AbstractAction {

    public permissions = [
        new UIComponentPermission('system/textmodules', [CRUD.CREATE])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#New Text Module';
        this.icon = 'kix-icon-new-gear';
    }

    public async run(event: any): Promise<void> {
        TextModuleDialogUtil.create();
    }

}
