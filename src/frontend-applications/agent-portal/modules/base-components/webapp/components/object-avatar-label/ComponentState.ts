/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ObjectIcon } from '../../../../icon/model/ObjectIcon';

export class ComponentState {

    public constructor(
        public displayText: string = '',
        public description: string = '',
        public icon: ObjectIcon | string = null,
        public rtl: boolean = false
    ) { }

}
