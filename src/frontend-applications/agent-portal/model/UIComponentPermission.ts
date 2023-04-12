/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { CRUD } from '../../../server/model/rest/CRUD';

export class UIComponentPermission {

    public value: CRUD = 0;

    public constructor(
        public target: string,
        public permissions: CRUD[] = [],
        public OR: boolean = false,
        public object?: any,
        public collection: boolean = true
    ) {
        permissions.forEach((p) => this.value = this.value | p);
    }

}
