import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ConfigurationBuilder } from './ConfigurationBuilder';

import { routeConfiguration } from '../../routes/FastifyAuthentication';

async function routes(fastify: FastifyInstance, options): Promise<void> {
    fastify.post('/config', routeConfiguration(fastify), rebuildConfiguration);
}

async function rebuildConfiguration(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    await ConfigurationBuilder.rebuildConfigCache();
    return reply.status(201).send();
}

export default routes;