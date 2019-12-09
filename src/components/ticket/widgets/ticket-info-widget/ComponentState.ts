/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ILabelProvider } from '../../../../core/browser';
import { AbstractAction, Ticket, WidgetComponentState, Organisation, Contact } from '../../../../core/model';

export class ComponentState extends WidgetComponentState {

    public constructor(
        public ticket: Ticket = null,
        public isPending: boolean = false,
        public isAccountTimeEnabled: boolean = false,
        public labelProvider: ILabelProvider<Ticket> = null,
        public actions: AbstractAction[] = [],
        public organisationProperties: string[] = null,
        public contactProperties: string[] = null,
        public organisation: Organisation = null,
        public contact: Contact = null,
        public prepared: boolean = false
    ) {
        super();
    }

}
