import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { FastifyInstance } from 'fastify';
import { Server } from '../../../Server';
import { ConfigurationBuilder } from '../../../../server/api/config/ConfigurationBuilder';
import { APIUtil } from '../../../api/APIUtil';

chai.use(chaiAsPromised);
const expect = chai.expect;

import { cookies } from '../authentication';
import { CacheService } from '../../../services/cache';
import { SysConfigService } from '../../../../modules/sysconfig/server/SysConfigService';
import { KIXObjectSpecificLoadingOptions } from '../../../../model/KIXObjectSpecificLoadingOptions';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { ObjectResponse } from '../../../services/ObjectResponse';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { SysConfigOptionProperty } from '../../../../modules/sysconfig/model/SysConfigOptionProperty';

describe('API - Context', () => {

    // let fastify: FastifyInstance;

    // before(async () => {
    //     require('../../../../../../../tests/TestSetup');
    //     fastify = await Server.getInstance().setupFastify();
    //     ConfigurationBuilder.rebuildConfigCache = async () => {
    //         return;
    //     };
    // });

    // after(() => {
    //     fastify.close();

    // });

    // describe('load context configuration', () => {

    //     let oldFunction = CacheService.getInstance().get;
    //     const contextId = 'test-context';

    //     before(() => {
    //         CacheService.getInstance().get = async (requestedContextId: string, type: string): Promise<any> => {
    //             let result;
    //             if (requestedContextId === contextId) {
    //                 result = { contextConfig: true };
    //             }
    //             return result;
    //         };
    //     });

    //     after(() => {
    //         CacheService.getInstance().get = oldFunction;
    //     });

    //     it('GET - 200 - /context/:contextId/configuration', async () => {
    //         const response = await fastify.inject({
    //             method: 'GET',
    //             url: APIUtil.URL_PREFIX + `/context/${contextId}/configuration`,
    //             cookies
    //         });

    //         expect(response.statusCode).equals(200);
    //         expect(JSON.parse(response?.payload)?.configuration?.contextConfig).true;
    //     });

    //     it('GET - 404 - /context/wrongId/configuration', async () => {
    //         const response = await fastify.inject({
    //             method: 'GET',
    //             url: APIUtil.URL_PREFIX + '/context/wrongId/configuration',
    //             cookies
    //         });

    //         expect(response.statusCode).equals(404);
    //     });

    //     it('GET - 401 - /context/:contextId/configuration', async () => {
    //         const response = await fastify.inject({
    //             method: 'GET',
    //             url: APIUtil.URL_PREFIX + '/context/id/configuration'
    //         });

    //         expect(response.statusCode).equals(401);
    //     });
    // });

    // describe('load context configurations', () => {

    //     let oldFunction = SysConfigService.getInstance().loadObjects;

    //     before(() => {
    //         SysConfigService.getInstance().loadObjects = async <O>(
    //             token: string, clientRequestId: string, objectType: string, objectIds: Array<string>,
    //             loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    //         ): Promise<ObjectResponse<O>> => {
    //             const response = new ObjectResponse<O>();
    //             const hasFilter = loadingOptions.filter?.some((fc) => fc.property === SysConfigOptionProperty.CONTEXT && fc.value === 'agent-portal');
    //             if (hasFilter && objectType === KIXObjectType.SYS_CONFIG_OPTION) {
    //                 (response.objects as any) = [{}, {}, {}];
    //                 response.totalCount = response.objects?.length;
    //             }
    //             return response;
    //         }
    //     });

    //     after(() => {
    //         SysConfigService.getInstance().loadObjects = oldFunction;
    //     });

    //     it('GET - 200 - /context/configurations?application=agent-portal', async () => {
    //         const response = await fastify.inject({
    //             method: 'GET',
    //             url: APIUtil.URL_PREFIX + `/context/configurationsapplication=agent-portal`,
    //             cookies
    //         });

    //         expect(response.statusCode).equals(200);
    //         expect(JSON.parse(response?.payload)?.configuration?.contextConfig).true;
    //     });

    //     it('GET - 404 - /context/configurations?application=wrongApp', async () => {
    //         const response = await fastify.inject({
    //             method: 'GET',
    //             url: APIUtil.URL_PREFIX + '/context/configurations?application=wrongApp',
    //             cookies
    //         });

    //         expect(response.statusCode).equals(404);
    //     });

    //     it('GET - 401 - /context/configurations/application=wrongApp', async () => {
    //         const response = await fastify.inject({
    //             method: 'GET',
    //             url: APIUtil.URL_PREFIX + '/context/configurations/wrongApp'
    //         });

    //         expect(response.statusCode).equals(401);
    //     });
    // });
});