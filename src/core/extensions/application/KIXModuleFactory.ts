/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXModuleExtension } from "./IKIXModuleExtension";
import { PermissionService } from "../../../services";

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

        const packageJson = require('../../../../package.json');
        const version = packageJson.version;
        const prePath = '/@kix/frontend$' + version + '/dist/';
        const preComponentPath = '/@kix/frontend$' + version + '/dist/components/';

        initComponents.forEach((m) => m.componentPath = prePath + m.componentPath);
        uiComponents.forEach((m) => m.componentPath = preComponentPath + m.componentPath);

        return {
            id: uiModule.id,
            external: uiModule.external,
            initComponents,
            uiComponents
        };
    }

}
