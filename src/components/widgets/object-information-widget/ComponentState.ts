/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { WidgetComponentState, KIXObject, AbstractAction } from "../../../core/model";
import { ILabelProvider } from "../../../core/browser";
import { RoutingConfiguration } from "../../../core/browser/router";

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
