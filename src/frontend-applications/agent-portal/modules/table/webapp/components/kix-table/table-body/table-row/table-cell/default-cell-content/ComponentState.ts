/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ObjectIcon } from '../../../../../../../../icon/model/ObjectIcon';
import { Cell } from '../../../../../../../model/Cell';

export class ComponentState {

    public constructor(
        public icons: Array<string | ObjectIcon> = null,
        public displayText: string = null,
        public cell: Cell = null,
        public showIcons: boolean = true,
        public showText: boolean = true
    ) { }

}
