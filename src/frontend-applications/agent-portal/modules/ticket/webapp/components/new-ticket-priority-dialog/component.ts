/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractNewDialog } from '../../../../../modules/base-components/webapp/core/AbstractNewDialog';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { RoutingConfiguration } from '../../../../../model/configuration/RoutingConfiguration';
import { TicketPriorityDetailsContext } from '../../core';
import { ContextMode } from '../../../../../model/ContextMode';
import { TicketPriorityProperty } from '../../../model/TicketPriorityProperty';

class Component extends AbstractNewDialog {

    public onCreate(): void {
        this.state = new ComponentState();
        super.init(
            'Translatable#Create Priority',
            'Translatable#Priority successfully created.',
            KIXObjectType.TICKET_PRIORITY,
            new RoutingConfiguration(
                TicketPriorityDetailsContext.CONTEXT_ID, KIXObjectType.TICKET_PRIORITY,
                ContextMode.DETAILS, TicketPriorityProperty.ID, true
            )
        );
    }

    public async onMount(): Promise<void> {
        await super.onMount();
    }

    public async onDestroy(): Promise<void> {
        await super.onDestroy();
    }

    public async cancel(): Promise<void> {
        await super.cancel();
    }

    public async submit(): Promise<void> {
        await super.submit();
    }

}

module.exports = Component;
