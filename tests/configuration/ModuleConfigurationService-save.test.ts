/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfiguration } from '../../src/core/model/configuration';

import * as chai from 'chai';
import { ModuleConfigurationService } from '../../src/services';
const expect = chai.expect;

/* tslint:disable*/
describe("ModuleConfigurationService / Save", () => {

    ModuleConfigurationService.getInstance().setConfigurationPath('../../config');

    describe('Save a configuration to defaults', () => {

        // it('should save the configuration', async () => {
        //     const configuration: IConfiguration = {
        //         id: 'test-configuration',
        //         name: 'Test Configuration',
        //         type: 'TestConfiguration'
        //     };
        //     try {
        //         await ModuleConfigurationService.getInstance().saveConfiguration(configuration);
        //         expect(true).true;
        //     } catch (erro) {
        //         expect(true).false;
        //     }
        // });

        // it('should trhow an error if configuration has no id', async () => {
        //     const configuration: IConfiguration = {
        //         id: undefined,
        //         name: 'Test Configuration',
        //         type: 'TestConfiguration'
        //     };
        //     try {
        //         await ModuleConfigurationService.getInstance().saveConfiguration(configuration)
        //         expect(false).true;
        //     } catch (error) {
        //         expect(error).exist;
        //         expect(error.Code).equals('-1');
        //     };
        // });

        // it('should trhow an error if configuration has no type', async () => {
        //     const configuration: IConfiguration = {
        //         id: 'test-configuration',
        //         name: 'Test Configuration',
        //         type: undefined
        //     };

        //     try {
        //         await ModuleConfigurationService.getInstance().saveConfiguration(configuration)
        //     } catch (error) {
        //         expect(error).exist;
        //         expect(error.Code).equals('-1');
        //     }
        // });
    });
});
