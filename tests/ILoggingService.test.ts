import * as chai from 'chai';
import { ConfigurationService, LoggingService } from '../src/core/services';
import { RequiredError } from '../src/core/decorators';

const expect = chai.expect;

/* tslint:disable:no-unused-expression*/
describe('Logging Service', () => {

    before(async () => {
        require('./TestSetup');
    });

    describe('Configuration', () => {
        let serverConfiguration;

        before(() => {
            serverConfiguration = ConfigurationService.getInstance().getServerConfiguration();
        });

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
                LoggingService.getInstance().error('test');
            } catch (error) {
                expect(error).not.undefined;
                expect(error).instanceof(RequiredError);
                expect(true, 'Error method throws an error although it should not!').false;
            }
        });
        it('Should throw an error if NO message is provided.', () => {
            let throwsError = false;
            try {
                LoggingService.getInstance().error(null);
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
                LoggingService.getInstance().warning('test');
            } catch (error) {
                expect(error).not.undefined;
                expect(error).instanceof(RequiredError);
                expect(true, 'Warning method throws an error although it should not!').false;
            }
        });
        it('Should throw an error if NO message is provided.', () => {
            let throwsError = false;
            try {
                LoggingService.getInstance().warning(null);
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
                LoggingService.getInstance().info('test');
            } catch (error) {
                expect(error).not.undefined;
                expect(error).instanceof(RequiredError);
                expect(true, 'Info method throws an error although it should not!').false;
            }
        });
        it('Should throw an error if NO message is provided.', () => {
            let throwsError = false;
            try {
                LoggingService.getInstance().info(null);
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
                LoggingService.getInstance().debug('test');
            } catch (error) {
                expect(error).not.undefined;
                expect(error).instanceof(RequiredError);
                expect(true, 'Debug method throws an error although it should not!').false;
            }
        });
        it('Should throw an error if NO message is provided.', () => {
            let throwsError = false;
            try {
                LoggingService.getInstance().debug(null);
            } catch (error) {
                throwsError = true;
                expect(error).not.undefined;
                expect(error).instanceof(RequiredError);
            }
            expect(throwsError, 'Debug method did not throw an error with invalid message argument!').true;
        });
    });
});
