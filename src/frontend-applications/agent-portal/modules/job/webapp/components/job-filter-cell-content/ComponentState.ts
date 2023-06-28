/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Cell } from '../../../../table/model/Cell';

export class ComponentState {

    public cell: Cell = null;
    public isLabelCell: boolean = true;
    public doLabelSort: boolean = true;
}
