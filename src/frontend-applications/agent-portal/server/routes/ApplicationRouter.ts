/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Request, Response } from 'express';
import { KIXRouter } from './KIXRouter';

import { AuthenticationService } from '../../../../server/services/AuthenticationService';

import path from 'path';
import { PluginService } from '../../../../server/services/PluginService';
import { IKIXModuleExtension } from '../../model/IKIXModuleExtension';
import { AgentPortalExtensions } from '../extensions/AgentPortalExtensions';
import { UIComponent } from '../../model/UIComponent';
import { PermissionService } from '../services/PermissionService';
import { ConfigurationService } from '../../../../server/services/ConfigurationService';
import { ProfilingService } from '../../../../server/services/ProfilingService';
import { HTMLUtil } from './HTMLUtil';

export class ApplicationRouter extends KIXRouter {

    private static INSTANCE: ApplicationRouter;

    private update: boolean = false;
    private socketTimeout: number;
    private socketTimeoutRequest: Promise<number>;

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

    public async sanitizeHTML(req: Request, res: Response, next: () => void): Promise<void> {
        let html = req.body?.html || '';

        html = HTMLUtil.sanitizeContent(html, true);
        html = HTMLUtil.buildHtmlStructur(html);

        res.status(201).send({
            html
        });
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

        this.router.post(
            '/sanitize-html',
            this.sanitizeHTML.bind(this)
        );

        this.router.get(
            '/healthcheck',
            async (req: Request, res: Response) => {
                res.status(200);
                res.send();
            }
        );

        this.router.get(
            '/benchmark',
            async (req: Request, res: Response) => {
                res.sendFile(path.join(__dirname, '../../static/benchmark/benchmark.html'));
            }
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

            const taskId = ProfilingService.getInstance().start(
                'ApplicationRouter', 'Application Request', { requestId: 'Applicationrouter', data: [] },
            );

            this.setFrontendSocketUrl(res);

            if (req.headers['x-forwarded-for']) {
                res.cookie('x-forwarded-for', req.headers['x-forwarded-for'], { httpOnly: true, path: '/' });
            }

            const token: string = req.cookies.token;

            const favIcon = await this.getIcon('agent-portal-icon');

            const templatePath = path.join('..', '..', 'modules', 'agent-portal', 'webapp', 'application');
            const template = require(templatePath).default;

            const uiModules = await this.getUIModules(token);

            const config = ConfigurationService.getInstance().getServerConfiguration();
            const baseRoute = config?.BASE_ROUTE || '';

            (res as any).marko(template, {
                favIcon,
                modules: uiModules,
                baseRoute
            });

            ProfilingService.getInstance().stop(taskId);
        }
    }

    private async getUIModules(token: string): Promise<IKIXModuleExtension[]> {
        let modules = await PluginService.getInstance().getExtensions<IKIXModuleExtension>(
            AgentPortalExtensions.MODULES
        );
        modules = modules.filter(
            (m) => !m.applications.length || m.applications.some((a) => a === 'agent-portal')
        );

        const createPromises: Array<Promise<IKIXModuleExtension>> = [];
        for (const uiModule of modules) {
            createPromises.push(this.createUIModule(token, uiModule));
        }

        const uiModules = await Promise.all(createPromises);
        return uiModules;
    }

    public async createUIModule(token: string, uiModule: IKIXModuleExtension): Promise<IKIXModuleExtension> {
        const initComponents = uiModule.initComponents?.filter((c) => c.permissions.length === 0);
        const initComponentsToCheck = uiModule.initComponents.filter((c) => c.permissions.length > 0);
        if (initComponentsToCheck?.length > 0) {
            const allowedInitComponentes = await this.filterUIComponents(token, initComponentsToCheck);
            initComponents.push(...allowedInitComponentes);
        }

        const uiComponents = uiModule.uiComponents.filter((c) => c.permissions.length === 0);
        const uiComponentsToCheck = uiModule.uiComponents.filter((c) => c.permissions.length > 0);
        if (uiComponentsToCheck?.length > 0) {
            const allowedComponents = await this.filterUIComponents(token, uiComponentsToCheck);
            uiComponents.push(...allowedComponents);
        }

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
        const promises: Array<Promise<UIComponent>> = [];
        for (const component of uiComponents) {
            promises.push(new Promise<UIComponent>((resolve, reject) => {
                PermissionService.getInstance().checkPermissions(token, component.permissions, 'ApplicationRouter')
                    .then((allowed: boolean) => allowed ? resolve(component) : reject())
                    .catch((e) => reject());
            }));
        }

        const result = await Promise.allSettled(promises);
        return result.filter((c) => c.status === 'fulfilled').map((c) => c.value);
    }

    public setUpdate(update: boolean): void {
        this.update = update;
    }
}
