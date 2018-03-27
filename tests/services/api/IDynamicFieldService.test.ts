/* tslint:disable*/
import { IConfigurationService, IDynamicFieldService } from '@kix/core/dist/services';
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');

import { container } from '../../../src/Container';

chai.use(chaiAsPromised);
const expect = chai.expect;

const resourcePath = "/dynamicfields";

describe('DynamicField Service', () => {
    let nockScope;
    let dynamicFieldService: IDynamicFieldService;
    let configurationService: IConfigurationService;
    let apiURL: string;

    before(async () => {
        await container.initialize();
        const nock = require('nock');
        dynamicFieldService = container.getDIContainer().get<IDynamicFieldService>("IDynamicFieldService");
        configurationService = container.getDIContainer().get<IConfigurationService>("IConfigurationService");
        apiURL = configurationService.getServerConfiguration().BACKEND_API_URL;
        nockScope = nock(apiURL);
    });

    it('service instance is registered in container.', () => {
        expect(dynamicFieldService).not.undefined;
    });

});