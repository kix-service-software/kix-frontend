/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthenticationService } from '../../../../server/services/AuthenticationService';
import { LoggingService } from '../../../../server/services/LoggingService';
import { UserType } from '../../modules/user/model/UserType';
import { APIUtil } from '../api/APIUtil';

// eslint-disable-next-line max-lines-per-function
export async function doSSOLogin(
    req: FastifyRequest, reply: FastifyReply, ssoEnabled: boolean,
    baseRoute: string, userType: UserType, application: string
): Promise<boolean> {
    let authType = '';
    let negotiationToken = '';

    if (ssoEnabled) {
        // check if we already have a negotiate token
        const authorization = req.headers['authorization'];
        if (typeof authorization === 'string' && authorization.split(' ')[0] === 'Negotiate') {
            // already negotiated (SSO)
            negotiationToken = authorization.split(' ')[1];
            authType = 'negotiate token (SSO)';
        } else if (!(req as any).cookies.authNegotiationDone && !(req as any).cookies.authNoSSO) {
            // no token - start the negotiation process
            (reply as any).cookie('authNegotiationDone', true, { httpOnly: true, path: '/' });
            reply.header('WWW-Authenticate', 'Negotiate');
            reply.status(401);
            reply.type('text/html; charset=utf-8');
            reply.send(
                `<!DOCTYPE html>
                    <html lang='en'>
                        <head>
                            <title>KIX SSO Login</title>
                            <meta http-equiv='refresh' content='3; URL=${req.url}'>
                        </head>
                        <body></body>
                    </html>`
            );
            return true;
        }
    }

    let user = '';
    if (req.headers['x-kix-user'] && typeof req.headers['x-kix-user'] === 'string') {
        // login with trusted header
        user = req.headers['x-kix-user'];
        authType = 'trusted HTTP header';
    }

    if (user || negotiationToken) {
        const token = await AuthenticationService.getInstance().login(
            user, null, userType, negotiationToken, null, null, null, false
        ).catch((e) => {
            LoggingService.getInstance().error('Error when trying to login with ' + authType);
            return null;
        });
        if (!token) {
            return false;
        }

        AuthenticationService.setSessionCookie(req, application, token);
        const url = APIUtil.getQueryValue(req, 'redirectUrl');
        const redirectUrl = url ? decodeURIComponent(url) : '/';
        reply.redirect(`${baseRoute}${redirectUrl}`);
        return true;
    }

    return false;
}