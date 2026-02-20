/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

// tslint:disable
import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { TicketService } from '../webapp/core/TicketService';
import { TicketModuleConfiguration } from '../model/TicketModuleConfiguration';
import { TicketObjectCommitHandler } from '../webapp/core/form/TicketObjectCommitHandler';
import { Ticket } from '../model/Ticket';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('AddSignature Configuration', () => {

    describe('Check legacy boolean config', () => {
        describe('Check legacy boolean config -> true', () => {

            let getConfigMethod: () => Promise<TicketModuleConfiguration>;

            before(() => {
                getConfigMethod = TicketService.getTicketModuleConfiguration;
                TicketService.getTicketModuleConfiguration = async (): Promise<TicketModuleConfiguration> => {
                    const config = new TicketModuleConfiguration();
                    (config.addQueueSignature as any) = true;
                    return config;
                }
            });

            after(() => {
                TicketService.getTicketModuleConfiguration = getConfigMethod;
            });

            it('Should return true', async () => {
                const commitHandler = new TicketObjectCommitHandler(undefined);
                const addQueueSignature = await (commitHandler as any).getAddQueueSignature(null);
                expect(addQueueSignature).true;
            });

        });

        describe('Check legacy boolean config -> false', () => {

            let getConfigMethod: () => Promise<TicketModuleConfiguration>;

            before(() => {
                getConfigMethod = TicketService.getTicketModuleConfiguration;
                TicketService.getTicketModuleConfiguration = async (): Promise<TicketModuleConfiguration> => {
                    const config = new TicketModuleConfiguration();
                    (config.addQueueSignature as any) = false;
                    return config;
                }
            });

            after(() => {
                TicketService.getTicketModuleConfiguration = getConfigMethod;
            });

            it('Should return false', async () => {
                const commitHandler = new TicketObjectCommitHandler(undefined);
                const addQueueSignature = await (commitHandler as any).getAddQueueSignature(null);
                expect(addQueueSignature).false;
            });

        });
    });

    describe('Check QueueSignatureConfiguration', () => {

        describe('Check default config (allways true)', () => {

            let getConfigMethod: () => Promise<TicketModuleConfiguration>;

            before(() => {
                getConfigMethod = TicketService.getTicketModuleConfiguration;
                TicketService.getTicketModuleConfiguration = async (): Promise<TicketModuleConfiguration> => {
                    return new TicketModuleConfiguration();
                }
            });

            after(() => {
                TicketService.getTicketModuleConfiguration = getConfigMethod;
            });

            it('Should return true', async () => {
                const commitHandler = new TicketObjectCommitHandler(undefined);
                const addQueueSignature = await (commitHandler as any).getAddQueueSignature(null);
                expect(addQueueSignature).true;
            });

        });

        describe('Check config -> false', () => {

            let getConfigMethod: () => Promise<TicketModuleConfiguration>;

            before(() => {
                getConfigMethod = TicketService.getTicketModuleConfiguration;
                TicketService.getTicketModuleConfiguration = async (): Promise<TicketModuleConfiguration> => {
                    const config = new TicketModuleConfiguration();
                    config.addQueueSignature.addQueueSignature = false;
                    return config;
                }
            });

            after(() => {
                TicketService.getTicketModuleConfiguration = getConfigMethod;
            });

            it('Should return false', async () => {
                const commitHandler = new TicketObjectCommitHandler(undefined);
                const addQueueSignature = await (commitHandler as any).getAddQueueSignature(null);
                expect(addQueueSignature).false;
            });

        });

        describe('Check config only new ticket -> true for new ticket', () => {

            let getConfigMethod: () => Promise<TicketModuleConfiguration>;

            before(() => {
                getConfigMethod = TicketService.getTicketModuleConfiguration;
                TicketService.getTicketModuleConfiguration = async (): Promise<TicketModuleConfiguration> => {
                    const config = new TicketModuleConfiguration();
                    config.addQueueSignature.newTicketOnly = true;
                    return config;
                }
            });

            after(() => {
                TicketService.getTicketModuleConfiguration = getConfigMethod;
            });

            it('Should return true', async () => {
                const commitHandler = new TicketObjectCommitHandler(undefined);
                const addQueueSignature = await (commitHandler as any).getAddQueueSignature(null);
                expect(addQueueSignature).true;
            });

        });

        describe('Check config only new ticket -> true for new ticket', () => {

            let getConfigMethod: () => Promise<TicketModuleConfiguration>;

            before(() => {
                getConfigMethod = TicketService.getTicketModuleConfiguration;
                TicketService.getTicketModuleConfiguration = async (): Promise<TicketModuleConfiguration> => {
                    const config = new TicketModuleConfiguration();
                    config.addQueueSignature.newTicketOnly = true;
                    return config;
                }
            });

            after(() => {
                TicketService.getTicketModuleConfiguration = getConfigMethod;
            });

            it('Should return true', async () => {
                const ticket = new Ticket();
                ticket.TicketID = null;
                const commitHandler = new TicketObjectCommitHandler(undefined);
                const addQueueSignature = await (commitHandler as any).getAddQueueSignature(ticket);
                expect(addQueueSignature).true;
            });

        });

        describe('Check config only new ticket -> false for existing ticket', () => {

            let getConfigMethod: () => Promise<TicketModuleConfiguration>;

            before(() => {
                getConfigMethod = TicketService.getTicketModuleConfiguration;
                TicketService.getTicketModuleConfiguration = async (): Promise<TicketModuleConfiguration> => {
                    const config = new TicketModuleConfiguration();
                    config.addQueueSignature.newTicketOnly = true;
                    return config;
                }
            });

            after(() => {
                TicketService.getTicketModuleConfiguration = getConfigMethod;
            });

            it('Should return false', async () => {
                const ticket = new Ticket();
                ticket.TicketID = 2;
                const commitHandler = new TicketObjectCommitHandler(undefined);
                const addQueueSignature = await (commitHandler as any).getAddQueueSignature(ticket);
                expect(addQueueSignature).false;
            });

        });

    });

});