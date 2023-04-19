/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
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
