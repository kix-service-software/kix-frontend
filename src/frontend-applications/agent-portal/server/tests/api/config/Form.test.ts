/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { FastifyInstance } from 'fastify';
import { Server } from '../../../Server';
import { APIUtil } from '../../../api/APIUtil';
import { CacheService } from '../../../services/cache';
import { ModuleConfigurationService } from '../../../services/configuration/ModuleConfigurationService';
import { FormContext } from '../../../../model/configuration/FormContext';

chai.use(chaiAsPromised);
const expect = chai.expect;

import { cookies } from '../authentication';

describe('API - Config / Form', () => {

    //     let fastify: FastifyInstance;

    //     before(async () => {
    //         require('../../../../../../../tests/TestSetup');
    //         fastify = await Server.getInstance().setupFastify();
    //     });

    //     after(() => {
    //         fastify.close();
    //     });

    //     describe('load all form configurations', () => {

    //         let getAllFunction = CacheService.getInstance().getAll;

    //         before(() => {
    //             CacheService.getInstance().getAll = async (id: string): Promise<any[]> => {
    //                 let result: any[] = [];
    //                 if (id === 'FormConfiguration') {
    //                     result = ['1', '2', '3'];
    //                 }
    //                 return result;
    //             };
    //         });

    //         after(() => {
    //             CacheService.getInstance().getAll = getAllFunction;
    //         });

    //         it('GET - 200 - /config/forms', async () => {
    //             const response = await fastify.inject({
    //                 method: 'GET',
    //                 url: APIUtil.URL_PREFIX + '/config/forms',
    //                 cookies
    //             });

    //             expect(response.statusCode).equals(200);
    //         });

    //         it('GET - 401 - /config/forms', async () => {
    //             const response = await fastify.inject({
    //                 method: 'GET',
    //                 url: APIUtil.URL_PREFIX + '/config/forms'
    //             });

    //             expect(response.statusCode).equals(401);
    //         });
    //     });

    //     describe('load specific form configuration', () => {

    //         let getFunction = CacheService.getInstance().get;
    //         const formId = 'abcdefg';

    //         before(() => {
    //             CacheService.getInstance().get = async (formIdParameter: string, type: string): Promise<any> => {
    //                 let result;
    //                 if (formIdParameter === formId && type === 'FormConfiguration') {
    //                     result = { form: true };
    //                 }
    //                 return result;
    //             };
    //         });

    //         after(() => {
    //             CacheService.getInstance().get = getFunction;
    //         });

    //         it('GET - 200 - /config/forms/:formId', async () => {
    //             const response = await fastify.inject({
    //                 method: 'GET',
    //                 url: `${APIUtil.URL_PREFIX}/config/forms/${formId}`,
    //                 cookies
    //             });

    //             expect(response.statusCode).equals(200);
    //             expect(JSON.parse(response?.payload)?.form).true;
    //         });

    //         it('GET - 401 - /config/forms/:formId', async () => {
    //             const response = await fastify.inject({
    //                 method: 'GET',
    //                 url: `${APIUtil.URL_PREFIX}/config/forms/${formId}`
    //             });

    //             expect(response.statusCode).equals(401);
    //         });

    //         it('GET - 404 - /config/forms/:formId', async () => {
    //             const response = await fastify.inject({
    //                 method: 'GET',
    //                 url: `${APIUtil.URL_PREFIX}/config/forms/wrongId`,
    //                 cookies
    //             });

    //             expect(response.statusCode).equals(404);
    //         });
    //     });

    //     describe('load form configurations by context', () => {

    //         let getFunction = ModuleConfigurationService.getInstance().getFormIDsWithContext;

    //         before(() => {
    //             ModuleConfigurationService.getInstance().getFormIDsWithContext = async (): Promise<Array<[FormContext, string, string]>> => {
    //                 return [[FormContext.NEW, 'test-form', 'test-form']];
    //             };
    //         });

    //         after(() => {
    //             ModuleConfigurationService.getInstance().getFormIDsWithContext = getFunction;
    //         });

    //         it('GET - 200 - /config/forms/context', async () => {
    //             const response = await fastify.inject({
    //                 method: 'GET',
    //                 url: APIUtil.URL_PREFIX + '/config/forms/context',
    //                 cookies
    //             });

    //             expect(response.statusCode).equals(200);

    //             const payload = JSON.parse(response?.payload);
    //             expect(payload?.formIdsWithContext).be.an('Array');
    //         });

    //         it('GET - 401 - /config/forms/context', async () => {
    //             const response = await fastify.inject({
    //                 method: 'GET',
    //                 url: APIUtil.URL_PREFIX + '/config/forms/context'
    //             });

    //             expect(response.statusCode).equals(401);
    //         });
    //     });

});