/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { RoutingConfiguration } from './configuration/RoutingConfiguration';
import { Attachment } from './kix/Attachment';

export class LabelValueGroupValue {

    public constructor(
        public value: string,
        public multiline: boolean = false,
        public attachment?: Attachment,
        public routingConfiguration: RoutingConfiguration = null
    ) { }

}
