/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction, WidgetComponentState, Ticket, DynamicField } from '../../../../core/model';

import { DynamicFieldsSettings } from './DynamicFieldsSettings';

export class ComponentState extends WidgetComponentState<DynamicFieldsSettings> {

    public constructor(
        public ticketId: number = null,
        public configuredDynamicFields: number[] = [],
        public filteredDynamicFields: DynamicField[] = [],
        public dynamicFields: DynamicField[] = [],
        public actions: AbstractAction[] = [],
        public ticket: Ticket = null
    ) {
        super();
    }

}
