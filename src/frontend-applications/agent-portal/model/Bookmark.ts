/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { UIComponentPermission } from './UIComponentPermission';
import { ObjectIcon } from '../modules/icon/model/ObjectIcon';

export class Bookmark {

    public constructor(
        public title: string,
        public icon: string | ObjectIcon,
        public actionId: string,
        public actionData: any = null,
        public permissions: UIComponentPermission[] = []
    ) { }

}
