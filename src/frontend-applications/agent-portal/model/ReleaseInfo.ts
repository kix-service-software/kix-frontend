/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SystemInfo } from './SystemInfo';

export class ReleaseInfo {

    public constructor(
        public product?: string,
        public version?: string,
        public buildDate?: string,
        public buildHost?: string,
        public buildNumber?: number,
        public patchNumber?: number,
        public dependencies?: Array<[string, string, string]>,
        public backendSystemInfo?: SystemInfo,
        public requires?: string,
        public plugins?: Array<ReleaseInfo>,
    ) {

    }
}
