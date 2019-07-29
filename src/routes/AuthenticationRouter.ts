/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Request, Response } from 'express';

import { KIXObjectType, SysConfigKey, SysConfigOption, ReleaseInfo } from '../core/model';
import { ConfigurationService, SysConfigService } from '../core/services';
import { KIXRouter } from './KIXRouter';
import * as Bowser from "bowser";

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
        this.router.get("/", this.login.bind(this));
    }

    public getContextId(): string {
        return "authentication";
    }

    public getBaseRoute(): string {
        return "/auth";
    }

    public async login(req: Request, res: Response): Promise<void> {
        if (this.isUnsupportedBrowser(req)) {
            res.redirect('/static/html/unsupported-browser/index.html');
        } else {
            const template = require('../components/_login-app/');
            this.setFrontendSocketUrl(res);

            const logout = req.query.logout !== undefined;

            const releaseInfo = ConfigurationService.getInstance().getConfiguration('release-info');

            const imprintLink = await this.getImprintLink()
                .catch((e) => '');

            let redirectUrl = '/';
            if (req.url !== '/auth') {
                redirectUrl = req.url;
            }

            res.marko(template, {
                login: true,
                logout,
                releaseInfo,
                imprintLink,
                redirectUrl
            });
        }
    }

    private isUnsupportedBrowser(req: Request): boolean {
        const browser = Bowser.getParser(req.headers['user-agent']);
        const requesteBrowser = browser.getBrowser();
        const unsupported = requesteBrowser.name === 'Internet Explorer' && requesteBrowser.version === '11.0';
        return unsupported;
    }

    private async getImprintLink(): Promise<string> {
        let imprintLink = '';
        const config = ConfigurationService.getInstance().getServerConfiguration();
        const imprintConfig = await SysConfigService.getInstance().loadObjects<SysConfigOption>(
            config.BACKEND_API_TOKEN, '', KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.IMPRINT_LINK],
            undefined, undefined
        );

        if (imprintConfig && imprintConfig.length) {
            const data = imprintConfig[0].Value;

            const defaultLangConfig = await SysConfigService.getInstance().loadObjects<SysConfigOption>(
                config.BACKEND_API_TOKEN, '', KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.DEFAULT_LANGUAGE],
                undefined, undefined
            );

            if (defaultLangConfig && defaultLangConfig.length) {
                imprintLink = data[defaultLangConfig[0].Value];
            } else {
                imprintLink = data['en'];
            }
        }

        return imprintLink;
    }

}
