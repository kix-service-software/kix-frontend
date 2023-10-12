/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractConfiguration } from '../../../../model/configuration/AbstractConfiguration';

export class CalendarConfiguration extends AbstractConfiguration {

    public constructor(
        public startDateProperty: string,
        public endDateProperty: string,
        public properties: string[] = [],
        public defaultView: string = 'month'
    ) {
        super();
    }

}
