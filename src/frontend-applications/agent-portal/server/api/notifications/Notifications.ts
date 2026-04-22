/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PortalNotificationService } from '../../../modules/portal-notification/server/PortalNotificationService';
import { APIUtil } from '../APIUtil';
import { ConfigurationService } from '../../../../../server/services/ConfigurationService';
import { BackendNotification } from '../../../model/BackendNotification';
import { ClientNotificationService } from '../../services/ClientNotificationService';

async function routes(fastify: FastifyInstance, options): Promise<void> {
    fastify.get('/notifications/:userType', loadNotifications);
    fastify.get('/notifications/prelogin/:userType', loadPreloginNotifications);
    fastify.get('/notifications/backend', waitForBackendNotifications);
    fastify.get('/notifications/portal', waitForPortalNotifications);
}

async function loadNotifications(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { userType } = (req as any).params;
    const notifications = PortalNotificationService.getInstance().getNotifications(userType) || [];
    return reply.status(200).send({ notifications });
}

async function loadPreloginNotifications(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { userType } = (req as any).params;
    const notifications = PortalNotificationService.getInstance().getPreLoginNotifications(userType) || [];
    return reply.status(200).send({ notifications });
}


async function waitForBackendNotifications(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { requestId } = APIUtil.getRequestData(req);

    const timeout = setTimeout(() => {
        reply.status(200).send({ notifications: [] });
        ClientNotificationService.getInstance().removeListener(requestId);
    }, ConfigurationService.getEnvNumber('NOTIFICATION_POLLING_TIMEOUT') || 5000);

    ClientNotificationService.getInstance().registerNotificationListener(
        requestId,
        (events: BackendNotification[]) => {
            clearTimeout(timeout);
            reply.status(200).send({ notifications: events });
            ClientNotificationService.getInstance().removeListener(requestId);
        }
    );

    return reply;
}

async function waitForPortalNotifications(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { requestId } = APIUtil.getRequestData(req);

    const timeout = setTimeout(() => {
        reply.status(200).send({ event: '' });
        PortalNotificationService.getInstance().removeListener(requestId);
    }, ConfigurationService.getEnvNumber('NOTIFICATION_POLLING_TIMEOUT') || 5000);

    PortalNotificationService.getInstance().registerNotificationListener(
        requestId,
        (event: string) => {
            clearTimeout(timeout);
            reply.status(200).send({ portalNotification: event });
            PortalNotificationService.getInstance().removeListener(requestId);
        }
    );

    return reply;
}

export default routes;