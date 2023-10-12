/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { ContextDescriptor } from '../../../../model/ContextDescriptor';

export class ContextHistoryEntry {

    public constructor(
        public icon: string | ObjectIcon,
        public displayText: string,
        public contextId: string,
        public objectId: string | number,
        public descriptor: ContextDescriptor,
        public lastVisitDate: number,
    ) { }

}
