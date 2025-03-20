/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { DynamicField } from '../../../model/DynamicField';
import { Label } from '../../../../base-components/webapp/core/Label';
import { CheckListItem } from '../../../model/CheckListItem';

export class ComponentState {

    public constructor(
        public field: DynamicField = null,
        public labels: Label[] = [],
        public checklist: CheckListItem[] = [],
        public table: Array<string[]> = []
    ) { }

}
