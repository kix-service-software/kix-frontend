import { IServerConfiguration } from '@kix/core/dist/common';
import { RequiredError } from '@kix/core/dist/decorators/RequiredError';
import { IConfigurationService, ILoggingService } from '@kix/core/dist/services';
import * as chai from 'chai';

import { container } from './../../src/Container';

const expect = chai.expect;

/* tslint:disable:no-unused-expression*/
describe('Logging Service', () => {
    let configurationService: IConfigurationService;
    let loggingService: ILoggingService;
    let serverConfiguration: IServerConfiguration;

    before(async () => {
        await container.initialize();
        configurationService = container.getDIContainer().get<IConfigurationService>("IConfigurationService");
        loggingService = container.getDIContainer().get<ILoggingService>("ILoggingService");
        serverConfiguration = configurationService.getServerConfiguration();
    });

    describe('Configuration', () => {
        it('Should contain LOG_LEVEL as type of number.', () => {
            expect(serverConfiguration.LOG_LEVEL).not.undefined;
            expect(serverConfiguration.LOG_LEVEL).a('number');
        });
        it('Should contain LOG_FILEDIR as type of string.', () => {
            expect(serverConfiguration.LOG_FILEDIR).not.undefined;
            expect(serverConfiguration.LOG_FILEDIR).a('string');
        });
        it('Should contain LOG_TRACE as type of boolean.', () => {
            expect(serverConfiguration.LOG_TRACE).not.undefined;
            expect(serverConfiguration.LOG_TRACE).a('boolean');
        });
    });
    describe('Error Logging', () => {
        it('Should not throw an error if message is provided.', () => {
            try {
                loggingService.error('test');
            } catch (error) {
                expect(error).not.undefined;
                expect(error).instanceof(RequiredError);
                expect(true, 'Error method throws an error although it should not!').false;
            }
        });
        it('Should throw an error if NO message is provided.', () => {
            let throwsError = false;
            try {
                loggingService.error(null);
            } catch (error) {
                throwsError = true;
                expect(error).not.undefined;
                expect(error).instanceof(RequiredError);
            }
            expect(throwsError, 'Error method did not throw an error with invalid message argument!').true;
        });
    });
    describe('Warning Logging', () => {
        it('Should not throw an error if message is provided.', () => {
            try {
                loggingService.warning('test');
            } catch (error) {
                expect(error).not.undefined;
                expect(error).instanceof(RequiredError);
                expect(true, 'Warning method throws an error although it should not!').false;
            }
        });
        it('Should throw an error if NO message is provided.', () => {
            let throwsError = false;
            try {
                loggingService.warning(null);
            } catch (error) {
                throwsError = true;
                expect(error).not.undefined;
                expect(error).instanceof(RequiredError);
            }
            expect(throwsError, 'Warning method did not throw an error with invalid message argument!').true;
        });
    });
    describe('Info Logging', () => {
        it('Should not throw an error if message is provided.', () => {
            try {
                loggingService.info('test');
            } catch (error) {
                expect(error).not.undefined;
                expect(error).instanceof(RequiredError);
                expect(true, 'Info method throws an error although it should not!').false;
            }
        });
        it('Should throw an error if NO message is provided.', () => {
            let throwsError = false;
            try {
                loggingService.info(null);
            } catch (error) {
                throwsError = true;
                expect(error).not.undefined;
                expect(error).instanceof(RequiredError);
            }
            expect(throwsError, 'Info method did not throw an error with invalid message argument!').true;
        });
    });
    describe('Debug Logging', () => {
        it('Should not throw an error if message is provided.', () => {
            try {
                loggingService.debug('test');
            } catch (error) {
                expect(error).not.undefined;
                expect(error).instanceof(RequiredError);
                expect(true, 'Debug method throws an error although it should not!').false;
            }
        });
        it('Should throw an error if NO message is provided.', () => {
            let throwsError = false;
            try {
                loggingService.debug(null);
            } catch (error) {
                throwsError = true;
                expect(error).not.undefined;
                expect(error).instanceof(RequiredError);
            }
            expect(throwsError, 'Debug method did not throw an error with invalid message argument!').true;
        });
    });
});
