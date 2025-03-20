/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export class ToggleOptions {

    public constructor(
        public componentId: string,
        public inputPropertyName: string,
        public actions: string[] = [],
        public toggleFirst: boolean = false,
        public data: any = {},
        public rowObjectProperty?: string,
        public toggleAll: boolean = false
    ) { }
}
