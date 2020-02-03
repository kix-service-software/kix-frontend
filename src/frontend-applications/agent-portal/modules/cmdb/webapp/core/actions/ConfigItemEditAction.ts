/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */


import { ConfigItemDialogUtil } from "../ConfigItemDialogUtil";
import { AbstractAction } from "../../../../../modules/base-components/webapp/core/AbstractAction";
import { ConfigItem } from "../../../model/ConfigItem";
import { UIComponentPermission } from "../../../../../model/UIComponentPermission";
import { CRUD } from "../../../../../../../server/model/rest/CRUD";

export class ConfigItemEditAction extends AbstractAction<ConfigItem> {

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('cmdb/configitems/*/versions', [CRUD.CREATE]),
        new UIComponentPermission('cmdb/configitems/*', [CRUD.UPDATE])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Edit';
        this.icon = "kix-icon-edit";
    }

    public async run(): Promise<void> {
        ConfigItemDialogUtil.edit();
    }

}
