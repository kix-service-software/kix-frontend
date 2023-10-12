/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { DynamicField } from '../../../model/DynamicField';
import { CheckListItem } from '../../core/CheckListItem';
import { Table } from '../../../../table/model/Table';

export class ComponentState {

    public constructor(
        public field: DynamicField = null,
        public checklist: CheckListItem[] = [],
        public table: Table = null
    ) { }

}
