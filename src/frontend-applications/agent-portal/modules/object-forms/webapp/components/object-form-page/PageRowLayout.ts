/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormGroupConfiguration } from '../../../../../model/configuration/FormGroupConfiguration';

export class PageRowLayout {

    public constructor(
        public groups: FormGroupConfiguration[],
        public colSM?: number,
        public colMD?: number,
        public colLG?: number
    ) { }

}