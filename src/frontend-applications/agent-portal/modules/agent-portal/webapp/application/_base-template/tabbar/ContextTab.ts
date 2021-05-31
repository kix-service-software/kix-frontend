/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ContextDescriptor } from '../../../../../../model/ContextDescriptor';
import { ObjectIcon } from '../../../../../icon/model/ObjectIcon';

export class ContextTab {
    public constructor(
        public icon: ObjectIcon | string,
        public displayText: string,
        public contextInstanceId: string,
        public objectId: number | string = null,
        public contextDescriptor: ContextDescriptor = null,
        public isDialog: boolean = false,
        public active: boolean = false,
        public refresh: boolean = false,
        public pinned: boolean = false
    ) { }
}
