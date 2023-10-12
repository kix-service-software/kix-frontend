/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

/* tslint:disable */

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { Ticket } from '../../src/frontend-applications/agent-portal/modules/ticket/model/Ticket';
import { TicketPlaceholderHandler } from '../../src/frontend-applications/agent-portal/modules/ticket/webapp/core/TicketPlaceholderHandler';
import { AbstractPlaceholderHandler } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/AbstractPlaceholderHandler';
import { PlaceholderService } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/PlaceholderService';
import { TicketLabelProvider } from '../../src/frontend-applications/agent-portal/modules/ticket/webapp/core/TicketLabelProvider';
import { LabelService } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/LabelService';
import { TranslationService } from '../../src/frontend-applications/agent-portal/modules/translation/webapp/core/TranslationService';
import { TicketProperty } from '../../src/frontend-applications/agent-portal/modules/ticket/model/TicketProperty';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Placeholder replacement for ticket extended attributes', () => {

    let ticket: Ticket;
    let ticketPlaceholderHandler: TicketPlaceholderHandler = new TicketPlaceholderHandler();
    before(() => {
        ticket = someTestFunctions.prepareTicket();

        const ticketLabelProvider = new TicketLabelProvider();
        ticketLabelProvider.getDisplayText = someTestFunctions.changedGetDisplayTextMethod;
        LabelService.getInstance().registerLabelProvider(ticketLabelProvider);
        (TranslationService.getInstance() as any).translations = {};

        ticketPlaceholderHandler.addExtendedPlaceholderHandler(new ExtendedTicketPlaceholderHandlerTest());
    });

    after(() => {
        LabelService.getInstance()['objectLabelProvider'] = []
        LabelService.getInstance()['propertiesLabelProvider'].clear();;
        (TranslationService.getInstance() as any).translations = null;
    });

    describe('Replace simple ticket attribute placeholder', async () => {

        it('Should replace ticket number placeholder', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.TICKET_NUMBER}>`, ticket);
            expect(text).equal(ticket.TicketNumber);
        });

        it('Should replace ticket title placeholder', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.TITLE}>`, ticket);
            expect(text).equal(ticket.Title);
        });
    });

    describe('Replace extended ticket attribute placeholder', async () => {

        it('Should replace ticket first extended attribute placeholder', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_extendedAttribute1>`, ticket);
            const extededAttributes = someTestFunctions.getExtendedAttributes();
            expect(text).equal(ticket[extededAttributes[0]]);
        });

        it('Should replace ticket second extended attribute placeholder', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_extendedAttribute2>`, ticket);
            const extededAttributes = someTestFunctions.getExtendedAttributes();
            expect(text).equal(ticket[extededAttributes[1]]);
        });

    });

});

class someTestFunctions {

    public static async changedGetDisplayTextMethod(ticket: Ticket, property: string): Promise<string> {
        let displayValue = ticket[property];
        return typeof displayValue !== 'undefined' && displayValue !== null ? displayValue.toString() : null;
    }

    public static prepareTicket(): Ticket {
        const ticket = new Ticket();

        ticket.TicketNumber = '123456';
        ticket.Title = 'Test-Ticket';

        const extededAttributes = this.getExtendedAttributes();

        ticket[extededAttributes[0]] = 'Attribute_1';
        ticket[extededAttributes[1]] = 'Attribute_2';

        return ticket;
    }

    public static getExtendedAttributes(): string[] {
        return ['extendedAttribute1', 'extendedAttribute2'];
    }
}

class ExtendedTicketPlaceholderHandlerTest extends AbstractPlaceholderHandler {

    public handlerId: string = '001-ExtendedTicketPlaceholderHandlerTest';

    public isHandlerFor(placeholder: string): boolean {
        const objectString = PlaceholderService.getInstance().getObjectString(placeholder);
        const attribute: string = PlaceholderService.getInstance().getAttributeString(placeholder);
        const extededAttributes = someTestFunctions.getExtendedAttributes();

        return objectString && objectString === 'TICKET' && attribute && (attribute === extededAttributes[0] || attribute === extededAttributes[1]);
    }

    public async replace(placeholder: string, ticket?: Ticket, language?: string): Promise<string> {
        let result = '';
        if (ticket && this.isHandlerFor(placeholder)) {
            const attribute: string = PlaceholderService.getInstance().getAttributeString(placeholder);
            if (attribute) {
                result = ticket[attribute];
            }
        }

        return result;
    }
}
