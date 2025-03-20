/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export class AutoCompleteConfiguration {

    public constructor(
        public limit: number = 10,
        public delay: number = 250,
        public charCount: number = 3,
        public noResultsObjectName: string = 'Translatable#Objects'
    ) { }

}
