/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
        public url: string = null,
        public isExternalUrl: boolean = false,
        public loading: boolean = false
    ) { }

}
