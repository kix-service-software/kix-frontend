import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { FastifyInstance } from 'fastify';
import { Server } from '../../../Server';
import { AdminModuleService } from '../../../../modules/admin/server/AdminModuleService';
import { APIUtil } from '../../../api/APIUtil';

chai.use(chaiAsPromised);
const expect = chai.expect;

import { cookies } from '../authentication';

describe('API - Admin', () => {

    // let fastify: FastifyInstance;
    // let oldFunction = AdminModuleService.getInstance().getAdminModules;

    // before(async () => {
    //     require('../../../../../../../tests/TestSetup');
    //     fastify = await Server.getInstance().setupFastify();
    //     AdminModuleService.getInstance().getAdminModules = async (token: string) => {
    //         return [];
    //     };
    // });

    // after(() => {
    //     fastify.close();
    //     AdminModuleService.getInstance().getAdminModules = oldFunction;
    // });

    // it('GET - 200 - /admin/modules', async () => {
    //     const response = await fastify.inject({
    //         method: 'GET',
    //         url: APIUtil.URL_PREFIX + '/admin/modules',
    //         cookies
    //     });

    //     expect(response.statusCode).equals(200);
    //     expect(Array.isArray(JSON.parse(response?.payload)?.modules)).true;
    // });

    // it('GET - 401 - /admin/modules', async () => {
    //     const response = await fastify.inject({
    //         method: 'GET',
    //         url: APIUtil.URL_PREFIX + '/admin/modules'
    //     });

    //     expect(response.statusCode).equals(401);
    // });

});