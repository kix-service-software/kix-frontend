/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { WidgetComponentState } from '../../../../../modules/base-components/webapp/core/WidgetComponentState';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { AbstractAction } from '../../../../../modules/base-components/webapp/core/AbstractAction';
import { RoutingConfiguration } from '../../../../../model/configuration/RoutingConfiguration';

export class ComponentState extends WidgetComponentState {

    public constructor(
        public object: KIXObject = null,
        public actions: AbstractAction[] = [],
        public properties: string[] = [],
        public flat: boolean = false,
        public routingConfigurations: Array<[string, RoutingConfiguration]> = null
    ) {
        super();
    }

}
