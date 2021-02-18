/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

/* tslint:disable */

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { Context } from '../../src/frontend-applications/agent-portal/model/Context';
import { ContextDescriptor } from '../../src/frontend-applications/agent-portal/model/ContextDescriptor';
import { KIXObjectType } from '../../src/frontend-applications/agent-portal/model/kix/KIXObjectType';
import { ContextType } from '../../src/frontend-applications/agent-portal/model/ContextType';
import { ContextMode } from '../../src/frontend-applications/agent-portal/model/ContextMode';
import { ContextSocketClient } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/ContextSocketClient';
import { ContextConfiguration } from '../../src/frontend-applications/agent-portal/model/configuration/ContextConfiguration';
import { ContextFactory } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/ContextFactory';

chai.use(chaiAsPromised);
const expect = chai.expect;

export class TestContext extends Context {

}

describe('ContextFactory', () => {

    let testDescriptorA: ContextDescriptor = new ContextDescriptor(
        'testContextA', [KIXObjectType.TICKET], ContextType.MAIN, ContextMode.DASHBOARD, false, '', null, TestContext
    );

    let testDescriptorB: ContextDescriptor = new ContextDescriptor(
        'testContextB', [KIXObjectType.QUEUE], ContextType.DIALOG, ContextMode.CREATE, false, '', null, TestContext
    );

    ContextSocketClient.getInstance().loadContextConfiguration = async (contextId): Promise<ContextConfiguration> => {
        return new ContextConfiguration(null, null, null, contextId);
    }

    before(() => {
        ContextFactory.getInstance().registerContext(testDescriptorA);
        ContextFactory.getInstance().registerContext(testDescriptorB);
    });

    describe('Get contexts from factory', () => {

        it('Should retrieve context by id', async () => {
            const contextA = await ContextFactory.getInstance().getContext(testDescriptorA.contextId, testDescriptorA.kixObjectTypes[0], testDescriptorA.contextMode);
            expect(contextA).not.undefined;
            expect(contextA.getDescriptor().contextMode).equals(ContextMode.DASHBOARD);

            const contextB = await ContextFactory.getInstance().getContext(testDescriptorB.contextId, testDescriptorB.kixObjectTypes[0], testDescriptorB.contextMode);
            expect(contextB).not.undefined;
            expect(contextB.getDescriptor().contextMode).equals(ContextMode.CREATE);
        });

        it('Should retrieve context by object type and context mode', async () => {
            const contextA = await ContextFactory.getInstance().getContext(null, testDescriptorA.kixObjectTypes[0], testDescriptorA.contextMode);
            expect(contextA).not.undefined;
            expect(contextA.getDescriptor().contextMode).equals(ContextMode.DASHBOARD);

            const contextB = await ContextFactory.getInstance().getContext(null, testDescriptorB.kixObjectTypes[0], testDescriptorB.contextMode);
            expect(contextB).not.undefined;
            expect(contextB.getDescriptor().contextMode).equals(ContextMode.CREATE);
        });

    });

});
