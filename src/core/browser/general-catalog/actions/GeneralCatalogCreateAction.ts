/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../model/components/action/AbstractAction';
import { CRUD, KIXObjectType, ContextMode } from '../../../model';
import { UIComponentPermission } from '../../../model/UIComponentPermission';
import { ContextService } from '../..';

export class GeneralCatalogCreateAction extends AbstractAction {

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('system/generalcatalog', [CRUD.CREATE]),
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#New Value';
        this.icon = 'kix-icon-new-gear';
    }

    public async run(event: any): Promise<void> {
        ContextService.getInstance().setDialogContext(
            null, KIXObjectType.GENERAL_CATALOG_ITEM, ContextMode.CREATE_ADMIN, null, true,
            'Translatable#General Catalog'
        );
    }

}
