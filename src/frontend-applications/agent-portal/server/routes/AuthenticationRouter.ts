/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Request, Response } from 'express';
import path from 'path';

import { KIXRouter } from './KIXRouter';
import * as Bowser from 'bowser';
import { ReleaseInfoUtil } from '../../../../server/ReleaseInfoUtil';
import { ConfigurationService } from '../../../../server/services/ConfigurationService';
import { SysConfigService } from '../../modules/sysconfig/server/SysConfigService';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { SysConfigKey } from '../../modules/sysconfig/model/SysConfigKey';
import { SysConfigOption } from '../../modules/sysconfig/model/SysConfigOption';
import { PluginService } from '../../../../server/services/PluginService';
import { IMarkoApplication } from '../extensions/IMarkoApplication';
import { AgentPortalExtensions } from '../extensions/AgentPortalExtensions';
import { LoggingService } from '../../../../server/services/LoggingService';
import { AuthenticationService } from '../../../../server/services/AuthenticationService';
import { UserType } from '../../modules/user/model/UserType';
import { ObjectResponse } from '../services/ObjectResponse';

export class AuthenticationRouter extends KIXRouter {

    private static INSTANCE: AuthenticationRouter;

    public static getInstance(): AuthenticationRouter {
        if (!AuthenticationRouter.INSTANCE) {
            AuthenticationRouter.INSTANCE = new AuthenticationRouter();
        }
        return AuthenticationRouter.INSTANCE;
    }

    private constructor() {
        super();
    }

    protected initialize(): void {
        this.router.get('/', this.login.bind(this));
        this.router.get('/logout', this.logout.bind(this));
    }

    public getContextId(): string {
        return 'authentication';
    }

    public getBaseRoute(): string {
        return '/auth';
    }

    public async logout(req: Request, res: Response): Promise<void> {
        const token: string = req.cookies.token;
        await AuthenticationService.getInstance().logout(token).catch(() => null);

        res.clearCookie('token');
        res.redirect('/login?logout=true');
    }

    public async login(req: Request, res: Response): Promise<void> {

        if (this.isUnsupportedBrowser(req)) {
            res.redirect('/static/html/unsupported-browser/index.html');
        }

        const config = ConfigurationService.getInstance().getServerConfiguration();
        const ssoEnabled = config?.SSO_ENABLED;

        let authType = '';
        let negotiationToken = '';

        if (ssoEnabled) {
            if (!req.cookies.authNegotiationDone && !req.cookies.authNoSSO) {
                res.cookie('authNegotiationDone', true, { httpOnly: true });
                res.setHeader('WWW-Authenticate', 'Negotiate');
                res.status(401);
                res.send(
                    `<!DOCTYPE html>
                    <html lang="en">
                        <head>
                            <title>KIX Agent Portal</title>
                            <meta http-equiv="refresh" content="3; URL=/">
                        </head>
                        <body></body>
                    </html>`
                );
            } else {
                const authorization = req.headers['authorization'];
                if (typeof authorization === 'string' && authorization.split(' ')[0] === 'Negotiate') {
                    // already negotiated (SSO)
                    negotiationToken = authorization.split(' ')[1];
                    authType = 'negotiate token (SSO)';
                }
            }
        }

        let user = '';
        if (req.headers['x-kix-user'] && typeof req.headers['x-kix-user'] === 'string') {
            // login with trusted header
            user = req.headers['x-kix-user'];
            authType = 'trusted HTTP header';
        }

        if (user || negotiationToken) {
            let success = true;
            const token = await AuthenticationService.getInstance().login(
                user, null, UserType.AGENT, negotiationToken, null, null, false
            ).catch((e) => {
                LoggingService.getInstance().error('Error when trying to login with ' + authType);
                success = false;
            });

            if (success) {
                res.cookie('token', token);
                res.clearCookie('authNegotiationDone');
                res.status(200);
                res.send(
                    `<!DOCTYPE html>
                            <html lang="en">
                                <head>
                                    <title>KIX Agent Portal</title>
                                    <meta http-equiv="refresh" content="3; URL=/">
                                </head>
                                <body></body>
                            </html>`
                );
            }
        }

        this.routeToLoginPage(req, res);
    }

    private async routeToLoginPage(req: Request, res: Response): Promise<void> {
        res.clearCookie('token');
        res.clearCookie('authNegotiationDone');
        res.cookie('authNoSSO', true, { httpOnly: true });

        if (req.headers['x-forwarded-for']) {
            res.cookie('x-forwarded-for', req.headers['x-forwarded-for']);
        }

        const applications = await PluginService.getInstance().getExtensions<IMarkoApplication>(
            AgentPortalExtensions.MARKO_APPLICATION
        );

        const app = applications.find((a) => a.name === 'authentication-login');

        if (app) {
            try {
                const folder = app.internal ? 'modules' : 'plugins';
                const templatePath = path.join(__dirname, '..', '..', folder, app.name, app.path);

                const template = require(templatePath).default;
                this.setFrontendSocketUrl(res);

                const logout = req.query.logout !== undefined;

                const releaseInfo = await ReleaseInfoUtil.getInstance().getReleaseInfo();

                const imprintLink = await this.getImprintLink()
                    .catch((e) => '');

                const url = req.query['redirectUrl']?.toString();
                const redirectUrl = decodeURIComponent(url) || '/';

                const favIcon = await this.getIcon('agent-portal-icon');
                const logo = await this.getIcon('agent-portal-logo');

                (res as any).marko(template, {
                    login: true, logout, releaseInfo, imprintLink, redirectUrl, favIcon, logo
                });
            } catch (error) {
                console.error(error);
                LoggingService.getInstance().error(error);
                res.status(404).send();
            }
        } else {
            res.status(404).send();
        }
    }

    private isUnsupportedBrowser(req: Request): boolean {
        let unsupported = true;

        const userAgent = req.headers['user-agent'];
        if (typeof userAgent === 'string') {
            const browser = Bowser.getParser(userAgent);
            const requesteBrowser = browser.getBrowser();
            unsupported = requesteBrowser.name === 'Internet Explorer' && requesteBrowser.version === '11.0';
        }

        return unsupported;
    }

    private async getImprintLink(): Promise<string> {
        let imprintLink = '';
        const config = ConfigurationService.getInstance().getServerConfiguration();
        const objectResponse = await SysConfigService.getInstance().loadObjects<SysConfigOption>(
            config.BACKEND_API_TOKEN, '', KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.IMPRINT_LINK],
            undefined, undefined
        ).catch(() => new ObjectResponse<SysConfigOption>());

        const imprintConfig = objectResponse?.objects || [];

        if (imprintConfig && imprintConfig.length) {
            const data = imprintConfig[0].Value;

            const response = await SysConfigService.getInstance().loadObjects<SysConfigOption>(
                config.BACKEND_API_TOKEN, '', KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.DEFAULT_LANGUAGE],
                undefined, undefined
            ).catch(() => new ObjectResponse<SysConfigOption>());

            const defaultLangConfig = response?.objects || [];
            if (defaultLangConfig && defaultLangConfig.length) {
                imprintLink = data[defaultLangConfig[0].Value];
            } else {
                imprintLink = data['en'];
            }
        }

        return imprintLink;
    }

}
