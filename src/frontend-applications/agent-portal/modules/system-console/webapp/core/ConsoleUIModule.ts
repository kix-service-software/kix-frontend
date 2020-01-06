/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from "../../../../model/IUIModule";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { ServiceRegistry } from "../../../../modules/base-components/webapp/core/ServiceRegistry";
import { FactoryService } from "../../../../modules/base-components/webapp/core/FactoryService";
import { ConsoleCommandService } from "./ConsoleCommandService";
import { ConsoleCommandBrowserFactory } from "./ConsoleCommandBrowserFactory";

export class UIModule implements IUIModule {

    public name: string = 'ConsoleUIModule';

    public async unRegister(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public priority: number = 800;

    public async register(): Promise<void> {
        ServiceRegistry.registerServiceInstance(ConsoleCommandService.getInstance());
        FactoryService.getInstance().registerFactory(
            KIXObjectType.CONSOLE_COMMAND, ConsoleCommandBrowserFactory.getInstance()
        );
    }

}
