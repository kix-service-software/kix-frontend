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
import { ConfigurationBuilder } from '../../../../server/api/config/ConfigurationBuilder';
import { APIUtil } from '../../../api/APIUtil';

chai.use(chaiAsPromised);
const expect = chai.expect;

import { cookies } from '../authentication';

describe('API - Config', () => {

    // let fastify: FastifyInstance;
    // let oldFunction = ConfigurationBuilder.rebuildConfigCache;

    // before(async () => {
    //     require('../../../../../../../tests/TestSetup');
    //     fastify = await Server.getInstance().setupFastify();
    //     ConfigurationBuilder.rebuildConfigCache = async () => {
    //         return;
    //     };
    // });

    // after(() => {
    //     fastify.close();
    //     ConfigurationBuilder.rebuildConfigCache = oldFunction;
    // });

    // it('POST - 201 - /config', async () => {
    //     const response = await fastify.inject({
    //         method: 'POST',
    //         url: APIUtil.URL_PREFIX + '/config',
    //         cookies
    //     });

    //     expect(response.statusCode).equals(201);
    // });

    // it('POST - 401 - /config', async () => {
    //     const response = await fastify.inject({
    //         method: 'POST',
    //         url: APIUtil.URL_PREFIX + '/config'
    //     });

    //     expect(response.statusCode).equals(401);
    // });

});