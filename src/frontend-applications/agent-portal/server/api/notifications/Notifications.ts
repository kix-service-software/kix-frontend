import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PortalNotificationService } from '../../../modules/portal-notification/server/PortalNotificationService';
import { ClientNotificationService } from '../../services/ClientNotificationService';
import { BackendNotification } from '../../../model/BackendNotification';
import { APIUtil } from '../APIUtil';
import { ConfigurationService } from '../../../../../server/services/ConfigurationService';

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
    }, ConfigurationService.getEnvNumber('NOTIFICATION_POLLING_TIMEOUT') || 30000);

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
    }, ConfigurationService.getEnvNumber('NOTIFICATION_POLLING_TIMEOUT') || 30000);

    PortalNotificationService.getInstance().registerNotificationListener(
        requestId,
        (event: string) => {
            clearTimeout(timeout);
            reply.status(200).send({ event });
            PortalNotificationService.getInstance().removeListener(requestId);
        }
    );

    return reply;
}

export default routes;