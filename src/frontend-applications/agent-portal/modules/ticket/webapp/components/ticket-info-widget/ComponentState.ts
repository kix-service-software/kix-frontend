/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { WidgetComponentState } from "../../../../../modules/base-components/webapp/core/WidgetComponentState";
import { Ticket } from "../../../model/Ticket";
import { ILabelProvider } from "../../../../../modules/base-components/webapp/core/ILabelProvider";
import { AbstractAction } from "../../../../../modules/base-components/webapp/core/AbstractAction";

export class ComponentState extends WidgetComponentState {

    public constructor(
        public ticket: Ticket = null,
        public labelProvider: ILabelProvider<Ticket> = null,
        public actions: AbstractAction[] = [],
        public organisationProperties: string[] = null,
        public contactProperties: string[] = null,
        public organisation = null,
        public contact = null,
        public prepared: boolean = false,
        public properties: string[] = []
    ) {
        super();
    }

}
