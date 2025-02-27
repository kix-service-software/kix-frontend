/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ObjectIcon } from '../../../../icon/model/ObjectIcon';
import { OverlayIcon } from '../../core/OverlayIcon';


export class ComponentState {

    public constructor(
        public propertyDisplayText: string = null,
        public propertyName: string = '',
        public propertyIcon: string | ObjectIcon = null,
        public hasText: boolean = true,
        public showLabel: boolean = true,
        public overlay: OverlayIcon = null
    ) { }

}
