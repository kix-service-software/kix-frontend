/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { WidgetSize } from './WidgetSize';
import { KIXObjectPropertyFilter } from '../filter';
import { ObjectIcon } from '../../kix';

export class WidgetConfiguration<T = any> {

    public constructor(
        public widgetId: string,
        public title: string,
        public actions: string[],
        public settings: T,
        public minimized: boolean = false,
        public minimizable: boolean = true,
        public icon: string | ObjectIcon = '',
        public contextDependent: boolean = false
    ) { }

}
