import { Request, Response } from 'express';

import { KIXObjectType, SysConfigKey, SysConfigItem } from '../core/model';
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

            const releaseInfo = await ConfigurationService.getInstance().getModuleConfiguration('release-info', null);

            const imprintLink = await this.getImprintLink();

            res.marko(template, {
                login: true,
                logout,
                releaseInfo,
                imprintLink
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
        const imprintConfig = await SysConfigService.getInstance().loadObjects<SysConfigItem>(
            config.BACKEND_API_TOKEN, '', KIXObjectType.SYS_CONFIG_ITEM, [SysConfigKey.IMPRINT_LINK],
            undefined, undefined
        );

        if (imprintConfig && imprintConfig.length) {
            const data = imprintConfig[0].Data;

            const defaultLangConfig = await SysConfigService.getInstance().loadObjects<SysConfigItem>(
                config.BACKEND_API_TOKEN, '', KIXObjectType.SYS_CONFIG_ITEM, [SysConfigKey.DEFAULT_LANGUAGE],
                undefined, undefined
            );

            if (defaultLangConfig && defaultLangConfig.length) {
                imprintLink = data[defaultLangConfig[0].Data];
            } else {
                imprintLink = data['en'];
            }
        }

        return imprintLink;
    }

}
