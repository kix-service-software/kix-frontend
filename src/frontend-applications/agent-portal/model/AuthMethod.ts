/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export class AuthMethod {

    public constructor(
        public type: string,
        public preAuth: boolean,
        public data: any,
        public name?: string
    ) {
        if (!name) {
            this.name = data?.AuthName ? data.AuthName : this.type;
        }
    }

}