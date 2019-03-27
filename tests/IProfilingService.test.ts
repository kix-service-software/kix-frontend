/* tslint:disable*/
import * as chai from 'chai';
import { ConfigurationService, ProfilingService } from '../src/core/services';
import { RequiredError } from '../src/core/decorators';

const expect = chai.expect;
describe('Profiling Service', () => {

    before(async () => {
        require('./TestSetup');
    });

    describe('Configuration', () => {
        it('Should contain ENABLE_PROFILING as type of boolean.', () => {
            const serverConfiguration = ConfigurationService.getInstance().getServerConfiguration();
            expect(serverConfiguration.ENABLE_PROFILING).not.undefined;
            expect(serverConfiguration.ENABLE_PROFILING).a('boolean');
        });
    });
    describe('Start Profiling.', () => {
        it('Should throw an error if NO category and message are provided.', () => {
            let throwsError = false;
            try {
                ProfilingService.getInstance().start(null, null);
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
                ProfilingService.getInstance().start('category', null);
            } catch (error) {
                throwsError = true;
                expect(error).not.undefined;
                expect(error).instanceof(RequiredError);
            }
            expect(throwsError, 'Error method did not throw an error with invalid message argument!').true;
        });
        it('Should not throw an error if message is provided and no data is provided.', () => {
            try {
                ProfilingService.getInstance().start('category', 'test');
            } catch (error) {
                expect(error).not.undefined;
                expect(error).instanceof(RequiredError);
                expect(true, 'Error method throws an error although it should not!').false;
            }
        });
        it('Should not throw an error if message and data is provided.', () => {
            try {
                ProfilingService.getInstance().start('category', 'test', 'data');
            } catch (error) {
                expect(error).not.undefined;
                expect(error).instanceof(RequiredError);
                expect(true, 'Error method throws an error although it should not!').false;
            }
        });
        it('Should return numeric ID if message is privided.', () => {
            const id = ProfilingService.getInstance().start('catgeory', 'test');
            expect(id).an('number');
        });
        it('Should return numeric ID if message and data is privided.', () => {
            const id = ProfilingService.getInstance().start('category', 'test', 'data');
            expect(id).an('number');
        });
    });
    describe('Stop Profiling.', () => {
        it('Should not throw an error if task id is provided.', () => {
            try {
                const id = ProfilingService.getInstance().start('category', 'test');
                ProfilingService.getInstance().stop(id);
            } catch (error) {
                expect(error).not.undefined;
                expect(error).instanceof(RequiredError);
                expect(true, 'Warning method throws an error although it should not!').false;
            }
        });
        it('Should throw an error if NO task id is provided.', () => {
            let throwsError = false;
            try {
                const id = ProfilingService.getInstance().start('category', 'test');
                ProfilingService.getInstance().stop(null);
            } catch (error) {
                throwsError = true;
                expect(error).not.undefined;
                expect(error).instanceof(RequiredError);
            }
            expect(throwsError, 'Warning method did not throw an error with invalid message argument!').true;
        });
    });
});
