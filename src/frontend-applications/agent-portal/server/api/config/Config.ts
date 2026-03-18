/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ConfigurationBuilder } from './ConfigurationBuilder';

import { routeConfiguration } from '../../routes/FastifyAuthentication';

async function routes(fastify: FastifyInstance, options): Promise<void> {
    fastify.post('/config', routeConfiguration(fastify), rebuildConfiguration);
}

async function rebuildConfiguration(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    await ConfigurationBuilder.getInstance().rebuildConfigCache();
    return reply.status(201).send();
}

export default routes;