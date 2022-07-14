/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AdminModule } from './AdminModule';
import { ObjectIcon } from '../../icon/model/ObjectIcon';

export class AdminModuleCategory {

    public constructor(
        category?: AdminModuleCategory,
        public id?: string,
        public name?: string,
        public icon?: string | ObjectIcon,
        public children: AdminModuleCategory[] = [],
        public modules: AdminModule[] = []
    ) {
        if (category) {
            this.id = category.id;
            this.name = category.name;
            this.icon = category.icon;
            this.children = category.children ? category.children.map((c) => new AdminModuleCategory(c)) : [];
            this.modules = category.modules ? category.modules.map((m) => new AdminModule(m)) : [];
        }
    }

}
