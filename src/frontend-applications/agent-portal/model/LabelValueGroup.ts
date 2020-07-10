/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Attachment } from './kix/Attachment';
import { ObjectIcon } from '../modules/icon/model/ObjectIcon';

export class LabelValueGroup {

    public constructor(
        public label: string,
        public value: string,
        public icon: string | ObjectIcon = null,
        public secondaryIcon: string | ObjectIcon = null,
        public sub: LabelValueGroup[] = null,
        public attachment?: Attachment
    ) { }

}
