/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractComponentState } from '../../core/AbstractComponentState';


export class ComponentState extends AbstractComponentState {

    public constructor(
        public isLeft: boolean = false,
        public isMobile: boolean = false,
        public isSmall: boolean = false,
        public sidebars: Array<[string, any, string]> = [],
        public showSidebarArea: boolean = false,
        public showMobile: boolean = false
    ) {
        super();
    }

}
