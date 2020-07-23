/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXModuleExtension } from '../../model/IKIXModuleExtension';
import { PermissionService } from '../services/PermissionService';

export class KIXModuleFactory {

    private static INSTANCE: KIXModuleFactory;

    public static getInstance(): KIXModuleFactory {
        if (!KIXModuleFactory.INSTANCE) {
            KIXModuleFactory.INSTANCE = new KIXModuleFactory();
        }
        return KIXModuleFactory.INSTANCE;
    }

    private constructor() { }

    public async create(token: string, uiModule: IKIXModuleExtension): Promise<IKIXModuleExtension> {
        const initComponents = await PermissionService.getInstance().filterUIComponents(
            token, [...uiModule.initComponents]
        );

        const uiComponents = await PermissionService.getInstance().filterUIComponents(
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

}
