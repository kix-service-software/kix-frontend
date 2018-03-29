/* tslint:disable*/
import { IConfigurationService, IDynamicFieldService } from '@kix/core/dist/services';
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');

import { ServiceContainer } from '@kix/core/dist/common';

chai.use(chaiAsPromised);
const expect = chai.expect;

const resourcePath = "/dynamicfields";

describe('DynamicField Service', () => {
    let nockScope;
    let dynamicFieldService: IDynamicFieldService;
    let configurationService: IConfigurationService;
    let apiURL: string;

    before(async () => {
        require('../../TestSetup');
        const nock = require('nock');
        dynamicFieldService = ServiceContainer.getInstance().getClass<IDynamicFieldService>("IDynamicFieldService");
        configurationService = ServiceContainer.getInstance().getClass<IConfigurationService>("IConfigurationService");
        apiURL = configurationService.getServerConfiguration().BACKEND_API_URL;
        nockScope = nock(apiURL);
    });

    it('service instance is registered in container.', () => {
        expect(dynamicFieldService).not.undefined;
    });

});