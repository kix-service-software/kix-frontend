/**
 * Copyright (C) 2006-2026 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import path from 'path';
import { ConfigurationService } from '../../../../server/services/ConfigurationService';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { UIModuleService } from '../services/UIModuleService';
import { APIUtil } from '../api/APIUtil';
import { MainMenuService } from '../services/MainMenuService';
import { ReleaseInfoUtil } from '../../../../server/ReleaseInfoUtil';
import { HTMLUtil } from '../../model/HTMLUtil';
import { MarkoService } from '../services/MarkoService';

async function routes(fastify: FastifyInstance, options): Promise<void> {

    fastify.post('/sanitize-html', sanitizeHTML);

    fastify.get('/healthcheck', (req: FastifyRequest, reply: FastifyReply) => {
        reply.status(200);
        return reply.send();
    });

    const preHandler = (fastify as any).auth([(fastify as any).verifyToken]);
    fastify.after(() => {
        fastify.get('/', { preHandler }, handleRoute);
        fastify.get('/:moduleId', { preHandler }, handleRoute);
        fastify.get('/:moduleId/:objectId', { preHandler }, handleRoute);
        fastify.get('/:moduleId/:objectId/*', { preHandler }, handleRoute);
    });

}

async function handleRoute(req: FastifyRequest, reply: FastifyReply): Promise<any> {
    if (req.headers['x-forwarded-for']) {
        (reply as any).setCookie('x-forwarded-for', req.headers['x-forwarded-for'], {
            httpOnly: true,
            path: '/'
        });
    }

    const { clientRequestId } = APIUtil.getRequestData(req);
    const token = APIUtil.getToken(req, 'agent-portal');

    const favIcon = await APIUtil.getIcon('agent-portal-icon');

    const templatePath = path.join('..', '..', 'modules', 'agent-portal', 'webapp', 'application');
    const template = require(templatePath).default;

    const uiModules = await UIModuleService.getUIModules(token);

    const mainMenu = await MainMenuService.loadMenuEntries(token, clientRequestId);
    const releaseInfo = await ReleaseInfoUtil.getInstance().getReleaseInfo();

    const baseRoute = ConfigurationService.getEnvString('BASE_ROUTE') || '';
    MarkoService.getInstance().configureLasso(baseRoute);
    return reply.marko(template, {
        favIcon,
        modules: uiModules,
        mainMenu,
        releaseInfo,
        baseRoute,
        application: 'agent-portal'
    });
}

async function sanitizeHTML(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const data = req.body as any;

    const cleanHTML = HTMLUtil.sanitizeContent(data.html, true);
    let html = cleanHTML?.content;
    html = HTMLUtil.buildHtmlStructur(html);

    return reply.status(201).send({ html });
}

export default routes;
