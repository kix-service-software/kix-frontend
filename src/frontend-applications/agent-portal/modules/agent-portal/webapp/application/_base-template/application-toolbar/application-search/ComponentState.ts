/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ObjectIcon } from '../../../../../../icon/model/ObjectIcon';

export class ComponentState {

    public constructor(
        public values: Array<[string, string, string | ObjectIcon]> = [],
        public canShow: boolean = false,
        public title: string = 'Search menu'
    ) { }

}
