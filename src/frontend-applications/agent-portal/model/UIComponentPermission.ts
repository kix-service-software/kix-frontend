/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { CRUD } from '../../../server/model/rest/CRUD';

export class UIComponentPermission {

    public value: CRUD;

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
