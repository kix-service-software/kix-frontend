/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { APIUtil } from '../APIUtil';
import { AdminModuleService } from '../../../modules/admin/server/AdminModuleService';

import { routeConfiguration } from '../../routes/FastifyAuthentication';
import { AdminModule } from '../../../modules/admin/model/AdminModule';

async function routes(fastify: FastifyInstance, options): Promise<void> {
    fastify.get('/admin/modules', routeConfiguration(fastify), loadAdminModules);
}

async function loadAdminModules(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { token } = APIUtil.getRequestData(req);

    let status = 200;
    let result;

    const modules = await AdminModuleService.getInstance().getAdminModules(token)
        .catch((error): AdminModule[] => {
            status = 400;
            result = error;
            return null;
        });

    if (Array.isArray(modules)) {
        result = { modules };
    }

    return reply.status(status).send(result);
}

export default routes;