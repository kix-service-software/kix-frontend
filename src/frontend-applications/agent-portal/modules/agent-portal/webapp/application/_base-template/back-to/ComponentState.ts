/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ContextHistoryEntry } from '../../../../../../modules/base-components/webapp/core/ContextHistoryEntry';

export class ComponentState {

    public constructor(
        public minimized: boolean = true,
        public history: ContextHistoryEntry[] = [],
        public keepShow: boolean = true
    ) { }

}
