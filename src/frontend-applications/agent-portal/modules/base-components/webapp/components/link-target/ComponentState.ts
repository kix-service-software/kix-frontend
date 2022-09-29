/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { RoutingConfiguration } from '../../../../../model/configuration/RoutingConfiguration';
import { KIXObject } from '../../../../../model/kix/KIXObject';

export class ComponentState {

    public constructor(
        public routingConfiguration: RoutingConfiguration = null,
        public objectId: string | number = null,
        public object: KIXObject = null,
        public url: string = null,
        public isExternalUrl: boolean = false,
        public loading: boolean = false
    ) { }

}
