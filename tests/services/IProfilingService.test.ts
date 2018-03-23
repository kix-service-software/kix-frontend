import { container } from './../../src/Container';
import { IConfigurationService, IProfilingService } from '@kix/core/dist/services';
import { IServerConfiguration } from '@kix/core/dist/common';
import { RequiredError } from '@kix/core/dist/decorators/RequiredError';
import * as chai from 'chai';

const expect = chai.expect;

/* tslint:disable:no-unused-expression*/
describe('Profiling Service', () => {
    let configurationService: IConfigurationService;
    let profilingService: IProfilingService;
    let serverConfiguration: IServerConfiguration;

    before(async () => {
        await container.initialize();
        configurationService = container.getDIContainer().get<IConfigurationService>("IConfigurationService");
        profilingService = container.getDIContainer().get<IProfilingService>("IProfilingService");
        serverConfiguration = configurationService.getServerConfiguration();
    });

    describe('Configuration', () => {
        it('Should contain ENABLE_PROFILING as type of boolean.', () => {
            expect(serverConfiguration.ENABLE_PROFILING).not.undefined;
            expect(serverConfiguration.ENABLE_PROFILING).a('boolean');
        });
    });
    describe('Start Profiling', () => {
        it('Should throw an error if NO category and message are provided.', () => {
            let throwsError = false;
            try {
                profilingService.start(null, null);
            } catch (error) {
                throwsError = true;
                expect(error).not.undefined;
                expect(error).instanceof(RequiredError);
            }
            expect(throwsError, 'Error method did not throw an error with invalid message argument!').true;
        });
        it('Should throw an error if NO message is provided.', () => {
            let throwsError = false;
            try {
                profilingService.start('category', null);
            } catch (error) {
                throwsError = true;
                expect(error).not.undefined;
                expect(error).instanceof(RequiredError);
            }
            expect(throwsError, 'Error method did not throw an error with invalid message argument!').true;
        });
        it('Should not throw an error if message is provided and no data is provided.', () => {
            try {
                profilingService.start('category', 'test');
            } catch (error) {
                expect(error).not.undefined;
                expect(error).instanceof(RequiredError);
                expect(true, 'Error method throws an error although it should not!').false;
            }
        });
        it('Should not throw an error if message and data is provided.', () => {
            try {
                profilingService.start('category', 'test', 'data');
            } catch (error) {
                expect(error).not.undefined;
                expect(error).instanceof(RequiredError);
                expect(true, 'Error method throws an error although it should not!').false;
            }
        });
        it('Should return numeric ID if message is privided.', () => {
            const id = profilingService.start('catgeory', 'test');
            expect(id).an('number');
        });
        it('Should return numeric ID if message and data is privided.', () => {
            const id = profilingService.start('category', 'test', 'data');
            expect(id).an('number');
        });
    });
    describe('Stop Profiling', () => {
        it('Should not throw an error if task id is provided.', () => {
            try {
                const id = profilingService.start('category', 'test');
                profilingService.stop(id);
            } catch (error) {
                expect(error).not.undefined;
                expect(error).instanceof(RequiredError);
                expect(true, 'Warning method throws an error although it should not!').false;
            }
        });
        it('Should throw an error if NO task id is provided.', () => {
            let throwsError = false;
            try {
                const id = profilingService.start('category', 'test');
                profilingService.stop(null);
            } catch (error) {
                throwsError = true;
                expect(error).not.undefined;
                expect(error).instanceof(RequiredError);
            }
            expect(throwsError, 'Warning method did not throw an error with invalid message argument!').true;
        });
    });
});
