/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export class GraphD3Link {

    public linkindex: number = 0;
    public linknum: number = 0;
    public bidirectional: boolean = false;

    public constructor(
        public source: string,
        public target: string,
        public linkType: string
    ) { }

}