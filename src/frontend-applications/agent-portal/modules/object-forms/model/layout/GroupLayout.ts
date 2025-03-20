/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FieldLayout } from './FieldLayout';
import { RowColumnLayout } from './RowColumnLayout';
import { RowLayout } from './RowLayout';

export class GroupLayout {

    public constructor(
        public groupId: string,
        public colSM?: number,
        public colMD?: number,
        public colLG?: number,
        public fieldLayout: FieldLayout[] = [],
        public rowLayout: Array<RowColumnLayout[]> = []
    ) { }

}