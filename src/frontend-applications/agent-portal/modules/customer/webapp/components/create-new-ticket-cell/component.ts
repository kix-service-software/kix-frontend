/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { Cell } from '../../../../table/model/Cell';
import { Contact } from '../../../model/Contact';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { NewTicketDialogContext, TicketDialogUtil } from '../../../../ticket/webapp/core';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { ConfigItem } from '../../../../cmdb/model/ConfigItem';
import { OrganisationDetailsContext } from '../../core/context/OrganisationDetailsContext';
import { TicketProperty } from '../../../../ticket/model/TicketProperty';

class Component extends AbstractMarkoComponent<ComponentState> {

    private object: KIXObject;
    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        if (input.cell) {
            const cell: Cell = input.cell;
            this.object = cell.getRow().getRowObject().getObject();
            this.update();

        }
    }

    private async update(): Promise<void> {
        const hasContextDescriptor = ContextService.getInstance().hasContextDescriptor(
            NewTicketDialogContext.CONTEXT_ID
        );
        this.state.show = this.object && hasContextDescriptor;
    }

    public labelClicked(event: any): void {
        event.stopPropagation();
        event.preventDefault();

        const additionalInformation = [];

        if (this.object instanceof Contact) {
            additionalInformation.push([KIXObjectType.CONTACT, this.object]);
        }

        if (this.object instanceof ConfigItem) {
            additionalInformation.push([`${KIXObjectType.CONFIG_ITEM}-ID`, [this.object.ConfigItemID]]);
        }

        const context = ContextService.getInstance().getActiveContext();
        if (context.contextId === OrganisationDetailsContext.CONTEXT_ID) {
            additionalInformation.push([TicketProperty.ORGANISATION_ID, context.getObjectId()]);
        }

        TicketDialogUtil.createTicket(null, null, null, null, additionalInformation);
    }

}

module.exports = Component;
