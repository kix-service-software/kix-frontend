/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

// tslint:disable
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');

import { NewTicketDialogContext } from '../webapp/core';
import { UIModule as TicketCreateUIModule } from '../webapp/core/TicketCreateUIModule';
import { ActionFactory } from '../../base-components/webapp/core/ActionFactory';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('TicketCreateUIModule', () => {

    let ticketModule: TicketCreateUIModule;

    before(() => {
        ticketModule = new TicketCreateUIModule();
    });

    describe('Should register the create module for ticket', () => {

        it('should register', async () => {
            await ticketModule.register();
        });

        it('should register the context for NewTicketDialogContext', () => {
            // const descriptor = ContextService.getInstance().getContextDescriptor(NewTicketDialogContext.CONTEXT_ID);
            // expect(descriptor).exist;
        });

        it('should register TicketCreateAction', () => {
            expect(ActionFactory.getInstance().hasAction('ticket-create-action')).true;
        });

    });

});