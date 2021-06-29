/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Request, Response } from 'express';
import { KIXRouter } from './KIXRouter';

import { AuthenticationService } from '../services/AuthenticationService';

import path = require('path');
import { SysConfigService } from '../../modules/sysconfig/server/SysConfigService';
import { SysConfigOption } from '../../modules/sysconfig/model/SysConfigOption';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { SysConfigKey } from '../../modules/sysconfig/model/SysConfigKey';
import { PluginService } from '../../../../server/services/PluginService';
import { IKIXModuleExtension } from '../../model/IKIXModuleExtension';
import { AgentPortalExtensions } from '../extensions/AgentPortalExtensions';
import { KIXModuleNamespace } from '../socket-namespaces/KIXModuleNamespace';
import { UIComponent } from '../../model/UIComponent';
import { PermissionService } from '../services/PermissionService';

export class ApplicationRouter extends KIXRouter {

    private static INSTANCE: ApplicationRouter;

    private update: boolean = false;

    public static getInstance(): ApplicationRouter {
        if (!ApplicationRouter.INSTANCE) {
            ApplicationRouter.INSTANCE = new ApplicationRouter();
        }
        return ApplicationRouter.INSTANCE;
    }

    private constructor() {
        super();
    }

    public getBaseRoute(): string {
        return '/';
    }

    public async getDefaultModule(req: Request, res: Response, next: () => void): Promise<void> {
        await this.handleRoute(req, res);
    }

    public async getModule(req: Request, res: Response, next: () => void): Promise<void> {
        const moduleId = req.params.moduleId;

        if (moduleId === 'socket.io') {
            next();
            return;
        }

        await this.handleRoute(req, res);
    }

    protected initialize(): void {
        this.router.get(
            '/',
            AuthenticationService.getInstance().isAuthenticated.bind(AuthenticationService.getInstance()),
            this.getDefaultModule.bind(this)
        );

        this.router.get(
            '/:moduleId',
            AuthenticationService.getInstance().isAuthenticated.bind(AuthenticationService.getInstance()),
            this.getModule.bind(this)
        );

        this.router.get(
            '/:moduleId/:objectId',
            AuthenticationService.getInstance().isAuthenticated.bind(AuthenticationService.getInstance()),
            this.getModule.bind(this)
        );

        this.router.get(
            '/:moduleId/:objectId/*',
            AuthenticationService.getInstance().isAuthenticated.bind(AuthenticationService.getInstance()),
            this.getModule.bind(this)
        );
    }

    private async handleRoute(req: Request, res: Response): Promise<void> {
        if (this.update) {
            res.redirect('/static/html/update-info/index.html');
        } else {
            this.setFrontendSocketUrl(res);
            this.clearRequireCache('../applications/_app');
            const token: string = req.cookies.token;
            const options = await SysConfigService.getInstance().loadObjects<SysConfigOption>(
                token, '', KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.BROWSER_SOCKET_TIMEOUT_CONFIG], null, null
            ).catch((): SysConfigOption[] => []);

            const favIcon = await this.getIcon('agent-portal-icon');

            const templatePath = path.join('..', '..', 'modules', 'agent-portal', 'webapp', 'application');
            const template = require(templatePath);

            const modules = await PluginService.getInstance().getExtensions<IKIXModuleExtension>(
                AgentPortalExtensions.MODULES
            );

            const createPromises: Array<Promise<IKIXModuleExtension>> = [];
            for (const uiModule of modules) {
                createPromises.push(this.createUIModule(token, uiModule));
            }

            const uiModules = await Promise.all(createPromises);

            res.marko(template, {
                socketTimeout: options && options.length ? options[0].Value : 30000,
                favIcon,
                modules: uiModules
            });
        }
    }

    public async createUIModule(token: string, uiModule: IKIXModuleExtension): Promise<IKIXModuleExtension> {
        const initComponents = await this.filterUIComponents(
            token, [...uiModule.initComponents]
        );

        const uiComponents = await this.filterUIComponents(
            token, [...uiModule.uiComponents]
        );

        return {
            id: uiModule.id,
            external: uiModule.external,
            initComponents,
            uiComponents,
            webDependencies: uiModule.webDependencies,
            applications: uiModule.applications
        };
    }

    public async filterUIComponents(token: string, uiComponents: UIComponent[]): Promise<UIComponent[]> {
        const components: UIComponent[] = [];
        for (const component of uiComponents) {
            if (await PermissionService.getInstance().checkPermissions(token, component.permissions)) {
                components.push(component);
            }
        }

        return components;
    }

    private clearRequireCache(configPath: string): void {
        try {
            const config = require.resolve(configPath);
            if (require.cache[config]) {
                delete require.cache[config];
            }
        } catch (error) {
            return;
        }
    }

    public setUpdate(update: boolean): void {
        this.update = update;
    }
}
