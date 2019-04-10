import { Request, Response } from 'express';

import { ReleaseInfo, KIXObjectType, SysConfigKey, SysConfigItem } from '../core/model';
import { ConfigurationService, SysConfigService } from '../core/services';
import { KIXRouter } from './KIXRouter';

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
        const template = require('../components/_login-app/');
        this.setFrontendSocketUrl(res);

        const logout = req.query.logout !== undefined;

        const releaseInfo = await ConfigurationService.getInstance().getModuleConfiguration('release-info', null);

        const impressLink = await this.getImpressLink();

        res.marko(template, {
            login: true,
            logout,
            releaseInfo,
            impressLink
        });
    }

    private async getImpressLink(): Promise<string> {
        let impressLink = '';
        const config = ConfigurationService.getInstance().getServerConfiguration();
        const impressConfig = await SysConfigService.getInstance().loadObjects<SysConfigItem>(
            config.BACKEND_API_TOKEN, '', KIXObjectType.SYS_CONFIG_ITEM, [SysConfigKey.IMPRESS_LINK],
            undefined, undefined
        );

        if (impressConfig && impressConfig.length) {
            const data = impressConfig[0].Data;

            const defaultLangConfig = await SysConfigService.getInstance().loadObjects<SysConfigItem>(
                config.BACKEND_API_TOKEN, '', KIXObjectType.SYS_CONFIG_ITEM, [SysConfigKey.DEFAULT_LANGUAGE],
                undefined, undefined
            );

            if (defaultLangConfig && defaultLangConfig.length) {
                impressLink = data[defaultLangConfig[0].Data];
            } else {
                impressLink = data['en'];
            }
        }

        return impressLink;
    }

}
