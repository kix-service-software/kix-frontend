/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');

import { ConfigurationType } from '../../src/frontend-applications/agent-portal/model/configuration/ConfigurationType';
import { ContextConfiguration } from '../../src/frontend-applications/agent-portal/model/configuration/ContextConfiguration';
import { Context } from '../../src/frontend-applications/agent-portal/model/Context';
import { ContextDescriptor } from '../../src/frontend-applications/agent-portal/model/ContextDescriptor';
import { ContextFormManager } from '../../src/frontend-applications/agent-portal/model/ContextFormManager';
import { ContextMode } from '../../src/frontend-applications/agent-portal/model/ContextMode';
import { ContextPreference } from '../../src/frontend-applications/agent-portal/model/ContextPreference';
import { ContextStorageManager } from '../../src/frontend-applications/agent-portal/model/ContextStorageManager';
import { ContextType } from '../../src/frontend-applications/agent-portal/model/ContextType';
import { KIXObjectType } from '../../src/frontend-applications/agent-portal/model/kix/KIXObjectType';
import { AuthenticationSocketClient } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/AuthenticationSocketClient';

import { ContextService } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/ContextService';
import { ContextSocketClient } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/ContextSocketClient';
import { FormInstance } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/FormInstance';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('ContextService', () => {

    before(async () => {
        require('../TestSetup');
        cleanupContextService();
    });

    describe('Register a single ContextDescriptor', () => {

        before(() => {
            ContextService.getInstance().registerContext(
                new ContextDescriptor(
                    TestContext1.CONTEXT_ID, [KIXObjectType.TICKET], ContextType.MAIN,
                    ContextMode.DASHBOARD, null, null, null, TestContext1
                )
            );
        });

        after(() => {
            cleanupContextService();
        });

        it('Should provide the descriptor by id', () => {
            const descriptor = ContextService.getInstance().getContextDescriptor(TestContext1.CONTEXT_ID);
            expect(descriptor).exist;
            expect(descriptor.contextId).equals(TestContext1.CONTEXT_ID);
        });

        it('Should provide a descriptor list by context mode.', () => {
            const descriptors = ContextService.getInstance().getContextDescriptors(ContextMode.DASHBOARD);
            expect(descriptors).exist;
            expect(descriptors).an('array');
            expect(descriptors.length).greaterThan(0);
            expect(descriptors[0].contextId).equals(TestContext1.CONTEXT_ID);

            expect(ContextService.getInstance().hasContextDescriptor(TestContext1.CONTEXT_ID));
        });

    });

    describe('Register multiple ContextDescriptor', () => {

        before(() => {
            ContextService.getInstance().registerContext(
                new ContextDescriptor(
                    TestContext1.CONTEXT_ID, [KIXObjectType.TICKET], ContextType.MAIN,
                    ContextMode.DASHBOARD, null, null, null, TestContext1
                )
            );
            ContextService.getInstance().registerContext(
                new ContextDescriptor(
                    TestContext2.CONTEXT_ID, [KIXObjectType.TICKET], ContextType.MAIN,
                    ContextMode.DETAILS, null, null, null, TestContext2
                )
            );
            ContextService.getInstance().registerContext(
                new ContextDescriptor(
                    TestContext3.CONTEXT_ID, [KIXObjectType.CONFIG_ITEM], ContextType.MAIN,
                    ContextMode.DASHBOARD, null, null, null, TestContext3
                )
            );
            ContextService.getInstance().registerContext(
                new ContextDescriptor(
                    TestContext4.CONTEXT_ID, [KIXObjectType.CONFIG_ITEM], ContextType.MAIN,
                    ContextMode.DETAILS, null, null, null, TestContext4
                )
            );
        });

        after(() => {
            cleanupContextService();
        });

        it('Should provide the descriptor by id for TestContext1', () => {
            const descriptor1 = ContextService.getInstance().getContextDescriptor(TestContext1.CONTEXT_ID);
            expect(descriptor1).exist;
            expect(descriptor1.contextId).equals(TestContext1.CONTEXT_ID);
            expect(ContextService.getInstance().hasContextDescriptor(TestContext1.CONTEXT_ID));
        });

        it('Should provide the descriptor by id for TestContext2', () => {
            const descriptor2 = ContextService.getInstance().getContextDescriptor(TestContext2.CONTEXT_ID);
            expect(descriptor2).exist;
            expect(descriptor2.contextId).equals(TestContext2.CONTEXT_ID);
            expect(ContextService.getInstance().hasContextDescriptor(TestContext2.CONTEXT_ID));
        });

        it('Should provide the descriptor by id for TestContext3', () => {
            const descriptor3 = ContextService.getInstance().getContextDescriptor(TestContext3.CONTEXT_ID);
            expect(descriptor3).exist;
            expect(descriptor3.contextId).equals(TestContext3.CONTEXT_ID);
            expect(ContextService.getInstance().hasContextDescriptor(TestContext3.CONTEXT_ID));
        });

        it('Should provide the descriptor by id for TestContext4', () => {
            const descriptor4 = ContextService.getInstance().getContextDescriptor(TestContext4.CONTEXT_ID);
            expect(descriptor4).exist;
            expect(descriptor4.contextId).equals(TestContext4.CONTEXT_ID);
            expect(ContextService.getInstance().hasContextDescriptor(TestContext4.CONTEXT_ID));
        });

        it('Should provide a descriptor list by context mode DASHBOARD.', () => {
            const descriptors = ContextService.getInstance().getContextDescriptors(ContextMode.DASHBOARD);
            expect(descriptors).exist;
            expect(descriptors).an('array');
            expect(descriptors.length).equals(2);
            expect(descriptors.some((d) => d.contextId === TestContext1.CONTEXT_ID)).true;
            expect(descriptors.some((d) => d.contextId === TestContext3.CONTEXT_ID)).true;
        });

        it('Should provide a descriptor list by context mode DETAILS.', () => {
            const descriptors = ContextService.getInstance().getContextDescriptors(ContextMode.DETAILS);
            expect(descriptors).exist;
            expect(descriptors).an('array');
            expect(descriptors.length).equals(2);
            expect(descriptors.some((d) => d.contextId === TestContext2.CONTEXT_ID)).true;
            expect(descriptors.some((d) => d.contextId === TestContext4.CONTEXT_ID)).true;
        });

    });

    describe('Create Context Instance', () => {

        let originalPermissionCheck;
        let originalLoadCOnfiguration;

        before(() => {
            ContextService.getInstance().registerContext(
                new ContextDescriptor(
                    TestContext1.CONTEXT_ID, [KIXObjectType.TICKET], ContextType.MAIN,
                    ContextMode.DASHBOARD, null, null, null, TestContext1
                )
            );

            originalPermissionCheck = AuthenticationSocketClient.getInstance().checkPermissions;
            originalLoadCOnfiguration = ContextSocketClient.getInstance().loadContextConfiguration;

            AuthenticationSocketClient.getInstance().checkPermissions =
                async () => true;
            ContextSocketClient.getInstance().loadContextConfiguration =
                async () => new ContextConfiguration(TestContext1.CONTEXT_ID, 'TestConfiguration', ConfigurationType.Context, TestContext1.CONTEXT_ID);
        });

        after(() => {
            cleanupContextService()
            AuthenticationSocketClient.getInstance().checkPermissions = originalPermissionCheck;
            ContextSocketClient.getInstance().loadContextConfiguration = originalLoadCOnfiguration;
        });

        it('should create and provide the context instance', async () => {
            const context = await ContextService.getInstance().createContext(TestContext1.CONTEXT_ID, null);
            expect(context).exist;
            expect(context.contextId).equals(TestContext1.CONTEXT_ID);
            expect(context.descriptor).exist;
            expect(context.getConfiguration()).exist;

            expect(ContextService.getInstance().hasContextInstance(TestContext1.CONTEXT_ID)).true;
            expect(ContextService.getInstance().getContext(context.instanceId)).exist;
        });

    });

    describe('Create multiple Context Instance', () => {

        let originalPermissionCheck;
        let originalLoadCOnfiguration;

        before(() => {
            ContextService.getInstance().registerContext(
                new ContextDescriptor(
                    TestContext1.CONTEXT_ID, [KIXObjectType.TICKET], ContextType.MAIN,
                    ContextMode.DASHBOARD, null, null, null, TestContext1
                )
            );

            ContextService.getInstance().registerContext(
                new ContextDescriptor(
                    TestContext2.CONTEXT_ID, [KIXObjectType.TICKET], ContextType.MAIN,
                    ContextMode.DASHBOARD, null, null, null, TestContext2
                )
            );

            ContextService.getInstance().registerContext(
                new ContextDescriptor(
                    TestContext3.CONTEXT_ID, [KIXObjectType.TICKET], ContextType.MAIN,
                    ContextMode.DASHBOARD, null, null, null, TestContext3
                )
            );

            ContextService.getInstance().registerContext(
                new ContextDescriptor(
                    TestContext4.CONTEXT_ID, [KIXObjectType.TICKET], ContextType.MAIN,
                    ContextMode.DASHBOARD, null, null, null, TestContext4
                )
            );

            originalPermissionCheck = AuthenticationSocketClient.getInstance().checkPermissions;
            originalLoadCOnfiguration = ContextSocketClient.getInstance().loadContextConfiguration;

            AuthenticationSocketClient.getInstance().checkPermissions =
                async () => true;
            ContextSocketClient.getInstance().loadContextConfiguration =
                async (contextId: string) => new ContextConfiguration(contextId, contextId, ConfigurationType.Context, contextId);
        });

        after(() => {
            cleanupContextService()
            AuthenticationSocketClient.getInstance().checkPermissions = originalPermissionCheck;
            ContextSocketClient.getInstance().loadContextConfiguration = originalLoadCOnfiguration;
        });

        it('should create and provide TestContext1', async () => {
            const context1 = await ContextService.getInstance().createContext(TestContext1.CONTEXT_ID, null);
            expect(context1).exist;
            expect(context1.contextId).equals(TestContext1.CONTEXT_ID);
            expect(context1.descriptor).exist;
            expect(context1.getConfiguration()).exist;
            expect(ContextService.getInstance().hasContextInstance(TestContext1.CONTEXT_ID)).true;
            expect(ContextService.getInstance().getContext(context1.instanceId)).exist;
        });

        it('should create and provide TestContext2', async () => {
            const context2 = await ContextService.getInstance().createContext(TestContext2.CONTEXT_ID, null);
            expect(context2).exist;
            expect(context2.contextId).equals(TestContext2.CONTEXT_ID);
            expect(context2.descriptor).exist;
            expect(context2.getConfiguration()).exist;
            expect(ContextService.getInstance().hasContextInstance(TestContext2.CONTEXT_ID)).true;
            expect(ContextService.getInstance().getContext(context2.instanceId)).exist;
        });

        it('should create and provide TestContext3', async () => {
            const context3 = await ContextService.getInstance().createContext(TestContext3.CONTEXT_ID, null);
            expect(context3).exist;
            expect(context3.contextId).equals(TestContext3.CONTEXT_ID);
            expect(context3.descriptor).exist;
            expect(context3.getConfiguration()).exist;
            expect(ContextService.getInstance().hasContextInstance(TestContext3.CONTEXT_ID)).true;
            expect(ContextService.getInstance().getContext(context3.instanceId)).exist;
        });

        it('should create and provide TestContext4', async () => {
            const context4 = await ContextService.getInstance().createContext(TestContext4.CONTEXT_ID, null);
            expect(context4).exist;
            expect(context4.contextId).equals(TestContext4.CONTEXT_ID);
            expect(context4.descriptor).exist;
            expect(context4.getConfiguration()).exist;
            expect(ContextService.getInstance().hasContextInstance(TestContext4.CONTEXT_ID)).true;
            expect(ContextService.getInstance().getContext(context4.instanceId)).exist;
        });

    });

    describe('Create multiple Context Instance but not redundant', () => {

        let originalPermissionCheck;
        let originalLoadCOnfiguration;

        before(async () => {
            ContextService.getInstance().registerContext(
                new ContextDescriptor(
                    TestContext1.CONTEXT_ID, [KIXObjectType.TICKET], ContextType.MAIN,
                    ContextMode.DASHBOARD, null, null, null, TestContext1
                )
            );

            ContextService.getInstance().registerContext(
                new ContextDescriptor(
                    TestContext2.CONTEXT_ID, [KIXObjectType.TICKET], ContextType.MAIN,
                    ContextMode.DASHBOARD, null, null, null, TestContext2
                )
            );

            ContextService.getInstance().registerContext(
                new ContextDescriptor(
                    TestContext3.CONTEXT_ID, [KIXObjectType.TICKET], ContextType.MAIN,
                    ContextMode.DASHBOARD, null, null, null, TestContext3
                )
            );

            ContextService.getInstance().registerContext(
                new ContextDescriptor(
                    TestContext4.CONTEXT_ID, [KIXObjectType.TICKET], ContextType.MAIN,
                    ContextMode.DASHBOARD, null, null, null, TestContext4
                )
            );

            originalPermissionCheck = AuthenticationSocketClient.getInstance().checkPermissions;
            originalLoadCOnfiguration = ContextSocketClient.getInstance().loadContextConfiguration;

            AuthenticationSocketClient.getInstance().checkPermissions =
                async () => true;
            ContextSocketClient.getInstance().loadContextConfiguration =
                async (contextId: string) => new ContextConfiguration(contextId, contextId, ConfigurationType.Context, contextId);

            await ContextService.getInstance().createContext(TestContext1.CONTEXT_ID, null);
            await ContextService.getInstance().createContext(TestContext2.CONTEXT_ID, null);
        });

        after(() => {
            cleanupContextService()
            AuthenticationSocketClient.getInstance().checkPermissions = originalPermissionCheck;
            ContextSocketClient.getInstance().loadContextConfiguration = originalLoadCOnfiguration;
        });

        it('should not create a new context instances for TestContext1', async () => {
            const context = await ContextService.getInstance().createContext(TestContext1.CONTEXT_ID, null);
            expect(context).exist;
            expect(context.contextId).equals(TestContext1.CONTEXT_ID);

            const instances = ContextService.getInstance().getContextInstances();
            expect(instances).an('array');
            expect(instances.length).equals(2);
        });

        it('should create a new context instances for TestContext3', async () => {
            const context = await ContextService.getInstance().createContext(TestContext3.CONTEXT_ID, null);
            expect(context).exist;
            expect(context.contextId).equals(TestContext3.CONTEXT_ID);

            const instances = ContextService.getInstance().getContextInstances();
            expect(instances).an('array');
            expect(instances.length).equals(3);
        });

        it('should not create a new context instances for TestContext2', async () => {
            const context = await ContextService.getInstance().createContext(TestContext2.CONTEXT_ID, null);
            expect(context).exist;
            expect(context.contextId).equals(TestContext2.CONTEXT_ID);

            const instances = ContextService.getInstance().getContextInstances();
            expect(instances).an('array');
            expect(instances.length).equals(3);
        });

        it('should create a new context instances for TestContext4', async () => {
            const context = await ContextService.getInstance().createContext(TestContext4.CONTEXT_ID, null);
            expect(context).exist;
            expect(context.contextId).equals(TestContext4.CONTEXT_ID);

            const instances = ContextService.getInstance().getContextInstances();
            expect(instances).an('array');
            expect(instances.length).equals(4);
        });

        it('should not create a new context instances for TestContext2', async () => {
            const context = await ContextService.getInstance().createContext(TestContext2.CONTEXT_ID, null);
            expect(context).exist;
            expect(context.contextId).equals(TestContext2.CONTEXT_ID);

            const instances = ContextService.getInstance().getContextInstances();
            expect(instances).an('array');
            expect(instances.length).equals(4);
        });

    });

    describe('Set active Context', () => {

        let originalPermissionCheck;
        let originalLoadCOnfiguration;

        before(() => {
            ContextService.getInstance().registerContext(
                new ContextDescriptor(
                    TestContext1.CONTEXT_ID, [KIXObjectType.TICKET], ContextType.MAIN,
                    ContextMode.DASHBOARD, null, null, null, TestContext1
                )
            );

            ContextService.getInstance().registerContext(
                new ContextDescriptor(
                    TestContext2.CONTEXT_ID, [KIXObjectType.TICKET], ContextType.MAIN,
                    ContextMode.DASHBOARD, null, null, null, TestContext2
                )
            );

            ContextService.getInstance().registerContext(
                new ContextDescriptor(
                    TestContext3.CONTEXT_ID, [KIXObjectType.TICKET], ContextType.MAIN,
                    ContextMode.DASHBOARD, null, null, null, TestContext3
                )
            );

            ContextService.getInstance().registerContext(
                new ContextDescriptor(
                    TestContext4.CONTEXT_ID, [KIXObjectType.TICKET], ContextType.MAIN,
                    ContextMode.DASHBOARD, null, null, null, TestContext4
                )
            );

            originalPermissionCheck = AuthenticationSocketClient.getInstance().checkPermissions;
            originalLoadCOnfiguration = ContextSocketClient.getInstance().loadContextConfiguration;

            AuthenticationSocketClient.getInstance().checkPermissions =
                async () => true;
            ContextSocketClient.getInstance().loadContextConfiguration =
                async (contextId: string) => new ContextConfiguration(contextId, contextId, ConfigurationType.Context, contextId);
        });

        after(() => {
            cleanupContextService()
            AuthenticationSocketClient.getInstance().checkPermissions = originalPermissionCheck;
            ContextSocketClient.getInstance().loadContextConfiguration = originalLoadCOnfiguration;
        });

        describe('provide a not existing active context instance (TestContext1)', () => {
            let context: Context;

            before(async () => {
                context = await ContextService.getInstance().setActiveContext(TestContext1.CONTEXT_ID);
            });

            it('should create a new context instance', async () => {
                expect(context).exist;
                expect(context.contextId).equals(TestContext1.CONTEXT_ID);
                expect(context.descriptor).exist;
                expect(context.getConfiguration()).exist;
                expect(ContextService.getInstance().hasContextInstance(TestContext1.CONTEXT_ID)).true;
                expect(ContextService.getInstance().getContext(context.instanceId)).exist;
            });

            it('should set and provide the context as active context', () => {
                const activeContext = ContextService.getInstance().getActiveContext();
                expect(activeContext).exist;
                expect(activeContext.contextId).equals(TestContext1.CONTEXT_ID);
            });
        });

        describe('provide another not existing active context instance (TestContext2)', () => {
            it('should create a new context instance', async () => {
                const context = await ContextService.getInstance().setActiveContext(TestContext2.CONTEXT_ID);
                expect(context).exist;
                expect(context.contextId).equals(TestContext2.CONTEXT_ID);
            });

            it('should set and provide the context as active context', () => {
                const context = ContextService.getInstance().getActiveContext();
                expect(context).exist;
                expect(context.contextId).equals(TestContext2.CONTEXT_ID);
            });
        });

        describe('provide another not existing active context instance (TestContext3)', () => {
            it('should create a new context instance', async () => {
                const context = await ContextService.getInstance().setActiveContext(TestContext3.CONTEXT_ID);
                expect(context).exist;
                expect(context.contextId).equals(TestContext3.CONTEXT_ID);
            });

            it('should set and provide the context as active context', () => {
                const context = ContextService.getInstance().getActiveContext();
                expect(context).exist;
                expect(context.contextId).equals(TestContext3.CONTEXT_ID);
            });
        });

        describe('provide another not existing active context instance (TestContext4)', () => {
            it('should create a new context instance', async () => {
                const context = await ContextService.getInstance().setActiveContext(TestContext4.CONTEXT_ID);
                expect(context).exist;
                expect(context.contextId).equals(TestContext4.CONTEXT_ID);
            });

            it('should set and provide the context as active context', () => {
                const context = ContextService.getInstance().getActiveContext();
                expect(context).exist;
                expect(context.contextId).equals(TestContext4.CONTEXT_ID);
            });
        });
    });

    describe('Toggle active Context', () => {

        let originalPermissionCheck;
        let originalLoadCOnfiguration;

        before(async () => {
            ContextService.getInstance().registerContext(
                new ContextDescriptor(
                    TestContext1.CONTEXT_ID, [KIXObjectType.TICKET], ContextType.MAIN,
                    ContextMode.DASHBOARD, null, null, null, TestContext1
                )
            );

            ContextService.getInstance().registerContext(
                new ContextDescriptor(
                    TestContext2.CONTEXT_ID, [KIXObjectType.TICKET], ContextType.MAIN,
                    ContextMode.DASHBOARD, null, null, null, TestContext2
                )
            );

            ContextService.getInstance().registerContext(
                new ContextDescriptor(
                    TestContext3.CONTEXT_ID, [KIXObjectType.TICKET], ContextType.MAIN,
                    ContextMode.DASHBOARD, null, null, null, TestContext3
                )
            );

            ContextService.getInstance().registerContext(
                new ContextDescriptor(
                    TestContext4.CONTEXT_ID, [KIXObjectType.TICKET], ContextType.MAIN,
                    ContextMode.DASHBOARD, null, null, null, TestContext4
                )
            );

            originalPermissionCheck = AuthenticationSocketClient.getInstance().checkPermissions;
            originalLoadCOnfiguration = ContextSocketClient.getInstance().loadContextConfiguration;

            AuthenticationSocketClient.getInstance().checkPermissions =
                async () => true;
            ContextSocketClient.getInstance().loadContextConfiguration =
                async (contextId: string) => new ContextConfiguration(contextId, contextId, ConfigurationType.Context, contextId);

            await ContextService.getInstance().createContext(TestContext1.CONTEXT_ID, null);
            await ContextService.getInstance().createContext(TestContext2.CONTEXT_ID, null);
            await ContextService.getInstance().createContext(TestContext3.CONTEXT_ID, null);
            await ContextService.getInstance().createContext(TestContext4.CONTEXT_ID, null);
        });

        after(() => {
            cleanupContextService()
            AuthenticationSocketClient.getInstance().checkPermissions = originalPermissionCheck;
            ContextSocketClient.getInstance().loadContextConfiguration = originalLoadCOnfiguration;
        });

        it('4 instances should be existing', () => {
            const instances = ContextService.getInstance().getContextInstances();
            expect(instances).exist;
            expect(instances).an('array');
            expect(instances.length).equals(4);
        });

        it('Should set the active context (TestContext2)', async () => {
            await ContextService.getInstance().setActiveContext(TestContext2.CONTEXT_ID);
            const context = ContextService.getInstance().getActiveContext();
            expect(context).exist;
            expect(context.contextId).equals(TestContext2.CONTEXT_ID);
        });

        it('Should set the active context (TestContext4)', async () => {
            await ContextService.getInstance().setActiveContext(TestContext4.CONTEXT_ID);
            const context = ContextService.getInstance().getActiveContext();
            expect(context).exist;
            expect(context.contextId).equals(TestContext4.CONTEXT_ID);
        });

        it('Should set the active context (TestContext1)', async () => {
            await ContextService.getInstance().setActiveContext(TestContext1.CONTEXT_ID);
            const context = ContextService.getInstance().getActiveContext();
            expect(context).exist;
            expect(context.contextId).equals(TestContext1.CONTEXT_ID);
        });

        it('Should set the active context (TestContext3)', async () => {
            await ContextService.getInstance().setActiveContext(TestContext3.CONTEXT_ID);
            const context = ContextService.getInstance().getActiveContext();
            expect(context).exist;
            expect(context.contextId).equals(TestContext3.CONTEXT_ID);
        });
    });

    describe('New instances should be sorted directly according to the active context', () => {

        let originalPermissionCheck;
        let originalLoadCOnfiguration;

        before(async () => {
            ContextService.getInstance().registerContext(
                new ContextDescriptor(
                    TestContext1.CONTEXT_ID, [KIXObjectType.TICKET], ContextType.MAIN,
                    ContextMode.DASHBOARD, null, null, null, TestContext1
                )
            );

            ContextService.getInstance().registerContext(
                new ContextDescriptor(
                    TestContext2.CONTEXT_ID, [KIXObjectType.TICKET], ContextType.MAIN,
                    ContextMode.DASHBOARD, null, null, null, TestContext2
                )
            );

            ContextService.getInstance().registerContext(
                new ContextDescriptor(
                    TestContext3.CONTEXT_ID, [KIXObjectType.TICKET], ContextType.MAIN,
                    ContextMode.DASHBOARD, null, null, null, TestContext3
                )
            );

            ContextService.getInstance().registerContext(
                new ContextDescriptor(
                    TestContext4.CONTEXT_ID, [KIXObjectType.TICKET], ContextType.MAIN,
                    ContextMode.DASHBOARD, null, null, null, TestContext4
                )
            );

            originalPermissionCheck = AuthenticationSocketClient.getInstance().checkPermissions;
            originalLoadCOnfiguration = ContextSocketClient.getInstance().loadContextConfiguration;

            AuthenticationSocketClient.getInstance().checkPermissions =
                async () => true;
            ContextSocketClient.getInstance().loadContextConfiguration =
                async (contextId: string) => new ContextConfiguration(contextId, contextId, ConfigurationType.Context, contextId);

            await ContextService.getInstance().createContext(TestContext1.CONTEXT_ID, null);
            await ContextService.getInstance().createContext(TestContext2.CONTEXT_ID, null);
            await ContextService.getInstance().setActiveContext(TestContext1.CONTEXT_ID);
        });

        after(() => {
            cleanupContextService()
            AuthenticationSocketClient.getInstance().checkPermissions = originalPermissionCheck;
            ContextSocketClient.getInstance().loadContextConfiguration = originalLoadCOnfiguration;
        });

        it('Should create a new instance after the active context', async () => {
            await ContextService.getInstance().createContext(TestContext3.CONTEXT_ID, null);
            const instances = ContextService.getInstance().getContextInstances();

            const index = instances.findIndex((c) => c.contextId === TestContext3.CONTEXT_ID);
            expect(index).equals(1);
        });

        it('should switch the active instance and create a new one directly according to this order', async () => {
            await ContextService.getInstance().setActiveContext(TestContext3.CONTEXT_ID);
            await ContextService.getInstance().createContext(TestContext4.CONTEXT_ID, null);
            const instances = ContextService.getInstance().getContextInstances();

            const index = instances.findIndex((c) => c.contextId === TestContext4.CONTEXT_ID);
            expect(index).equals(2);
        });

        it('the instances should have the correct order', async () => {
            const instances = ContextService.getInstance().getContextInstances();
            expect(instances.length).equals(4);
            expect(instances[0].contextId).equals(TestContext1.CONTEXT_ID);
            expect(instances[1].contextId).equals(TestContext3.CONTEXT_ID);
            expect(instances[2].contextId).equals(TestContext4.CONTEXT_ID);
            expect(instances[3].contextId).equals(TestContext2.CONTEXT_ID);
        });

    });

    describe('Remove context', () => {

        let originalPermissionCheck;
        let originalLoadConfiguration;
        let origianlGetStoredContextList;

        before(async () => {
            ContextService.getInstance().registerContext(
                new ContextDescriptor(
                    TestContext1.CONTEXT_ID, [KIXObjectType.TICKET], ContextType.MAIN,
                    ContextMode.DASHBOARD, null, null, null, TestContext1
                )
            );

            ContextService.getInstance().registerContext(
                new ContextDescriptor(
                    TestContext2.CONTEXT_ID, [KIXObjectType.TICKET], ContextType.MAIN,
                    ContextMode.DASHBOARD, null, null, null, TestContext2
                )
            );

            ContextService.getInstance().registerContext(
                new ContextDescriptor(
                    TestContext3.CONTEXT_ID, [KIXObjectType.TICKET], ContextType.MAIN,
                    ContextMode.DASHBOARD, null, null, null, TestContext3
                )
            );

            ContextService.getInstance().registerContext(
                new ContextDescriptor(
                    TestContext4.CONTEXT_ID, [KIXObjectType.TICKET], ContextType.MAIN,
                    ContextMode.DASHBOARD, null, null, null, TestContext4
                )
            );

            originalPermissionCheck = AuthenticationSocketClient.getInstance().checkPermissions;
            originalLoadConfiguration = ContextSocketClient.getInstance().loadContextConfiguration;
            origianlGetStoredContextList = ContextService.getInstance().getStoredContextList;

            AuthenticationSocketClient.getInstance().checkPermissions =
                async () => true;
            ContextSocketClient.getInstance().loadContextConfiguration =
                async (contextId: string) => new ContextConfiguration(contextId, contextId, ConfigurationType.Context, contextId);
            ContextService.getInstance().getStoredContextList =
                async (): Promise<ContextPreference[]> => [];

            await ContextService.getInstance().createContext(TestContext1.CONTEXT_ID, null);
            await ContextService.getInstance().createContext(TestContext2.CONTEXT_ID, null);
            await ContextService.getInstance().createContext(TestContext3.CONTEXT_ID, null);
            await ContextService.getInstance().createContext(TestContext4.CONTEXT_ID, null);
        });

        after(() => {
            cleanupContextService()
            AuthenticationSocketClient.getInstance().checkPermissions = originalPermissionCheck;
            ContextSocketClient.getInstance().loadContextConfiguration = originalLoadConfiguration;
            ContextService.getInstance().getStoredContextList = origianlGetStoredContextList;
        });

        it('Should remove the context TestContext3', async () => {
            let instances = ContextService.getInstance().getContextInstances();
            const context = instances.find((c) => c.contextId === TestContext3.CONTEXT_ID);
            const success = await ContextService.getInstance().removeContext(context.instanceId);

            expect(success).true;
            instances = ContextService.getInstance().getContextInstances();
            expect(instances).an('array');
            expect(instances.length).equals(3);
        });

        it('Should remove the context TestContext1', async () => {
            let instances = ContextService.getInstance().getContextInstances();
            const context = instances.find((c) => c.contextId === TestContext1.CONTEXT_ID);
            const success = await ContextService.getInstance().removeContext(context.instanceId);

            expect(success).true;
            instances = ContextService.getInstance().getContextInstances();
            expect(instances).an('array');
            expect(instances.length).equals(2);
        });

        it('Should remove the context TestContext4', async () => {
            let instances = ContextService.getInstance().getContextInstances();
            const context = instances.find((c) => c.contextId === TestContext4.CONTEXT_ID);
            const success = await ContextService.getInstance().removeContext(context.instanceId);

            expect(success).true;
            instances = ContextService.getInstance().getContextInstances();
            expect(instances).an('array');
            expect(instances.length).equals(1);
        });

        it('Should remove the context TestContext2', async () => {
            let instances = ContextService.getInstance().getContextInstances();
            const context = instances.find((c) => c.contextId === TestContext2.CONTEXT_ID);
            const success = await ContextService.getInstance().removeContext(context.instanceId);

            expect(success).true;
            instances = ContextService.getInstance().getContextInstances();
            expect(instances).an('array');
            expect(instances.length).equals(0);
        });

    });
});

function cleanupContextService(): void {
    const service: any = ContextService.getInstance();
    service.contextDescriptorList = [];
    service.contextInstances = [];
    service.contextCreatePromises = new Map();
    service.serviceListener = new Map();
    service.activeContext = null
    service.contextExtensions = new Map();
}


export class TestContext1 extends Context {

    public static CONTEXT_ID = 'TestContext1'

    public constructor(
        descriptor: ContextDescriptor,
        objectId: string | number = null,
        configuration: ContextConfiguration = null,
        instanceId?: string,
        formManager?: ContextFormManager,
        storageManager?: ContextStorageManager
    ) {
        super(descriptor, objectId, configuration, instanceId, new TestFormManager(), new TestStorageManager())
    }
}

class TestContext2 extends Context {

    public static CONTEXT_ID = 'TestContext2'

    public constructor(
        descriptor: ContextDescriptor,
        objectId: string | number = null,
        configuration: ContextConfiguration = null,
        instanceId?: string,
        formManager?: ContextFormManager,
        storageManager?: ContextStorageManager
    ) {
        super(descriptor, objectId, configuration, instanceId, new TestFormManager(), new TestStorageManager())
    }

}

class TestContext3 extends Context {

    public static CONTEXT_ID = 'TestContext3'

    public constructor(
        descriptor: ContextDescriptor,
        objectId: string | number = null,
        configuration: ContextConfiguration = null,
        instanceId?: string,
        formManager?: ContextFormManager,
        storageManager?: ContextStorageManager
    ) {
        super(descriptor, objectId, configuration, instanceId, new TestFormManager(), new TestStorageManager())
    }

}

class TestContext4 extends Context {

    public static CONTEXT_ID = 'TestContext4'

    public constructor(
        descriptor: ContextDescriptor,
        objectId: string | number = null,
        configuration: ContextConfiguration = null,
        instanceId?: string,
        formManager?: ContextFormManager,
        storageManager?: ContextStorageManager
    ) {
        super(descriptor, objectId, configuration, instanceId, new TestFormManager(), new TestStorageManager())
    }

}

class TestStorageManager extends ContextStorageManager {

    public constructor(
        protected context?: Context
    ) {
        super(context)
    }

    public async getStorableContextPreference(forceRemove?: boolean): Promise<ContextPreference> {
        return null;
    }

    public async loadStoredValues(contextPreference: ContextPreference): Promise<void> {
        return;
    }
}

class TestFormManager extends ContextFormManager {

    public constructor(
        protected context?: Context
    ) {
        super(context)
    }

    public async getFormId(): Promise<string> {
        return null;
    }

    public async getFormInstance(createNewInstance?: boolean, silent?: boolean): Promise<FormInstance> {
        return null;
    }

    public async setFormId(formId: string): Promise<void> {
        return;
    }

    public async addStorableValue(contextPreference: ContextPreference): Promise<void> {
        return;
    }

    public async loadStoredValue(contextPreference: ContextPreference): Promise<void> {
        return;
    }
}