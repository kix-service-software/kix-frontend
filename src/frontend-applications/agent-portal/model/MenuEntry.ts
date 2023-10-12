/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ObjectIcon } from '../modules/icon/model/ObjectIcon';

export class MenuEntry {

    public constructor(
        public icon: string | ObjectIcon,
        public text: string,
        public mainContextId: string,
        public contextIds: string[],
        public active?: boolean,
        public show?: boolean
    ) { }

}
