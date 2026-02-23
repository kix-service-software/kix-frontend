/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { CacheService } from '../../services/cache';
import { ModuleConfigurationService } from '../../services/configuration/ModuleConfigurationService';

import { routeConfiguration } from '../../routes/FastifyAuthentication';

async function routes(fastify: FastifyInstance, options): Promise<void> {
    fastify.get('/config/forms', routeConfiguration(fastify), loadFormConfigurations);
    fastify.get('/config/forms/:formId', routeConfiguration(fastify), loadFormConfiguration);
    fastify.get('/config/forms/context', routeConfiguration(fastify), loadFormConfigurationsByContext);
}

async function loadFormConfigurations(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    let status = 200;
    const formConfigurations = await CacheService.getInstance().getAll('FormConfiguration').catch((e) => {
        status = 400;
        return [];
    });
    return reply.status(status).send({ formConfigurations });
}

async function loadFormConfiguration(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { formId } = req.params as any;
    let status = 200;

    const formConfiguration = await CacheService.getInstance().get(formId, 'FormConfiguration').catch((e) => null);
    if (!formConfiguration) {
        status = 404;
    }
    return reply.status(status).send({ formConfiguration });
}

async function loadFormConfigurationsByContext(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const formIdsWithContext = await ModuleConfigurationService.getInstance().getFormIDsWithContext();
    return reply.status(200).send({ formIdsWithContext });
}

export default routes;