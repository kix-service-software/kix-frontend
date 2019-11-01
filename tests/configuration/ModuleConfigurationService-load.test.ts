/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfiguration } from '../../src/core/model/configuration';
import { ModuleConfigurationService } from '../../src/services';

import * as chai from 'chai';
const expect = chai.expect;

/* tslint:disable*/
describe("ModuleCnfigurationService / Load", () => {

    ModuleConfigurationService.getInstance().setConfigurationPath('../../config');

    describe('Save a configuration to defaults', () => {

        // it('should save the configuration', async () => {
        //     const configuration: IConfiguration = {
        //         id: 'load-test-configuration',
        //         name: 'Load Test Configuration',
        //         type: 'LoadTestConfiguration'
        //     };
        //     try {
        //         await ModuleConfigurationService.getInstance().saveConfiguration(configuration);
        //         expect(true).true;
        //     } catch (erro) {
        //         expect(true).false;
        //     }
        // });

        // it('should load the configuration', async () => {
        //     try {
        //         const configuration = await ModuleConfigurationService.getInstance().loadConfiguration('LoadTestConfiguration', 'load-test-configuration');
        //         expect(configuration).exist;
        //         expect(configuration.id).equals('load-test-configuration');
        //         expect(configuration.name).equals('Load Test Configuration');
        //         expect(configuration.type).equals('LoadTestConfiguration');
        //     } catch (error) {
        //         console.log(error);
        //         expect(true).false;
        //     }
        // });
    });
});
