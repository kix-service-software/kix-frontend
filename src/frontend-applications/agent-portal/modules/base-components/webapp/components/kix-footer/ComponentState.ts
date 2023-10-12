/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ReleaseInfo } from '../../../../../model/ReleaseInfo';

export class ComponentState {

    public constructor(
        public kixVersion: string = null,
        public kixProduct: string = null,
        public currentUserLogin: string = null,
        public buildNumber: string = null,
        public releaseInfo: ReleaseInfo = null,
        public imprintLink: string = null,
        public unauthorized: boolean = false
    ) { }

}
