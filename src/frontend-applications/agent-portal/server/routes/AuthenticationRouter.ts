/**
 * Copyright (C) 2006-2026 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import path from 'path';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { AuthenticationService } from '../../../../server/services/AuthenticationService';
import { ConfigurationService } from '../../../../server/services/ConfigurationService';
import { PluginService } from '../../../../server/services/PluginService';
import { AgentPortalExtensions } from '../extensions/AgentPortalExtensions';
import { IRouterHandler } from '../model/IRouterHandler';
import { MFAService } from '../../modules/multifactor-authentication/server/MFAService';
import { LoggingService } from '../../../../server/services/LoggingService';
import { IMarkoApplication } from '../extensions/IMarkoApplication';
import { APIUtil } from '../api/APIUtil';
import { doSSOLogin } from './SSOAuthentication';
import { MarkoService } from '../services/MarkoService';
import { UserType } from '../../modules/user/model/UserType';
import { PasswordResetState } from '../../model/PasswordResetState';

async function routes(fastify: FastifyInstance, options): Promise<void> {
    const authHandler = await PluginService.getInstance().getExtensions<IRouterHandler>(
        AgentPortalExtensions.AUTH_ROUTER_HANDLER
    );

    fastify.route({
        method: 'GET',
        url: '/auth',
        preHandler: authHandler.map((ah) => ah.preHandler),
        handler: login
    });

    fastify.get('/auth/password-reset/:resetToken', sendUserPasswordResetRequestConfirmation);
}

export default routes;

async function login(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const ssoSuccess = await doSSOLogin(
        req, reply, ConfigurationService.isEnvSetTrue('SSO_ENABLED'),
        ConfigurationService.getEnvString('BASE_ROUTE'), UserType.AGENT
    );
    if (!ssoSuccess) {
        return routeToLoginPage(req, reply);
    }
}

// eslint-disable-next-line max-lines-per-function
async function routeToLoginPage(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    (reply as any).clearCookie('authNegotiationDone');
    (reply as any).cookie('authNoSSO', true, { httpOnly: true, path: '/' });

    if (req.headers['x-forwarded-for']) {
        (reply as any).cookie('x-forwarded-for', req.headers['x-forwarded-for'], { httpOnly: true, path: '/' });
    }

    const applications = await PluginService.getInstance().getExtensions<IMarkoApplication>(
        AgentPortalExtensions.MARKO_APPLICATION
    );

    const app = applications.find((a) => a.name === 'agent-portal-login');

    if (app) {
        try {
            const folder = app.internal ? 'modules' : 'plugins';
            const templatePath = path.join(__dirname, '..', '..', folder, app.path);

            const template = require(templatePath).default;

            const imprintLink = await APIUtil.getImprintLink().catch((e) => '');

            const pwResetEnabled = await AuthenticationService.getInstance().getUserPasswordResetEnabled();
            const pwResetState = req.query['pwResetState']?.toString();

            const url = req.query['redirectUrl'];
            const redirectUrl = url ? decodeURIComponent(url) : '/';

            const favIcon = await APIUtil.getIcon('agent-portal-icon');
            const logo = await APIUtil.getIcon('agent-portal-logo');

            const error = !!req.query['error'];

            const authMethods = await AuthenticationService.getInstance().getAuthMethods();
            const mfaEnabled = MFAService.getInstance().isMFAEnabled(authMethods);
            const mfaConfigs = await MFAService.getInstance().loadMFAConfigs();
            const mfaConfig = mfaEnabled ? mfaConfigs?.find((mfac) => mfac.enabled) : null;

            const baseRoute = ConfigurationService.getEnvString('BASE_ROUTE') || '';
            MarkoService.getInstance().configureLasso(baseRoute);

            return (reply as any).marko(template, {
                application: 'agent-portal',
                imprintLink, redirectUrl, favIcon, logo,
                mfaConfig, pwResetEnabled, pwResetState, error, baseRoute,
                authMethods
            });
        } catch (error) {
            console.error(error);
            LoggingService.getInstance().error(error);
            return reply.status(404).send('Application not found!');
        }
    } else {
        return reply.status(404).send('Application not found!');
    }
}

async function sendUserPasswordResetRequestConfirmation(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const resetToken = (req.params as any)?.resetToken?.toString();

    let pwResetState = PasswordResetState.ERROR;

    if (resetToken) {
        pwResetState = await AuthenticationService.getInstance().sendUserPasswordResetRequestConfirmation(
            resetToken
        );
    }

    const baseRoute = ConfigurationService.getEnvString('BASE_ROUTE') || '';
    reply.redirect(`${baseRoute}/auth?pwResetState=${pwResetState}`);
}