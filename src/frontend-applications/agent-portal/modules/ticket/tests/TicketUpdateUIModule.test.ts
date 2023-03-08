/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

// tslint:disable
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');

import { UIModule as TicketUpdateUIModule } from '../webapp/core/TicketUpdateUIModule';
import { TicketFormService, TicketBulkManager, EditTicketDialogContext } from '../webapp/core';
import { ActionFactory } from '../../base-components/webapp/core/ActionFactory';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { ServiceRegistry } from '../../base-components/webapp/core/ServiceRegistry';
import { ServiceType } from '../../base-components/webapp/core/ServiceType';
import { BulkService } from '../../bulk/webapp/core';
import { CRUD } from '../../../../../server/model/rest/CRUD';
import { ContextService } from '../../base-components/webapp/core/ContextService';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('TicketUpdateUIModule', () => {

    let ticketModule: TicketUpdateUIModule;

    before(() => {
        ticketModule = new TicketUpdateUIModule();
        (ticketModule as any).checkPermissions = async (resource: string, crud: CRUD): Promise<boolean> => {
            return true;
        };
    });

    describe('Should register the update module for ticket', () => {

        it('should register', async () => {
            await ticketModule.register();
        });

        it('Should register the TicketFormService', () => {
            const service = ServiceRegistry.getServiceInstance(KIXObjectType.TICKET, ServiceType.FORM);
            expect(service).exist;
            expect(service).instanceof(TicketFormService);
        });

        it('should register TicketBulkManager', () => {
            const manager = BulkService.getInstance().getBulkManager(KIXObjectType.TICKET);
            expect(manager).exist;
            expect(manager).instanceof(TicketBulkManager);
        });

        it('should register the context for EditTicketDialogContext', () => {
            // const descriptor = ContextService.getInstance().getContextDescriptor(EditTicketDialogContext.CONTEXT_ID);
            // expect(descriptor).exist;
        });

        it('should register TicketEditAction', () => {
            expect(ActionFactory.getInstance().hasAction('ticket-edit-action')).true;
        });
    });

});
