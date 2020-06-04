/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LogFileTableFactory } from "./table/LogFileTableFactory";
import { LogFileLabelProvider } from "./LogFileLabelProvider";
import { LogFileService } from "./LogFileService";
import { LogFileBrowserFactory } from "./LogFileBrowserFactory";
import { IUIModule } from "../../../../model/IUIModule";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { TableFactoryService, TableCSSHandlerRegistry } from "../../../base-components/webapp/core/table";
import { LabelService } from "../../../../modules/base-components/webapp/core/LabelService";
import { ServiceRegistry } from "../../../../modules/base-components/webapp/core/ServiceRegistry";
import { FactoryService } from "../../../../modules/base-components/webapp/core/FactoryService";
import { LogFileTableCSSHandler } from "./table/LogFileTableCSSHandler";

export class UIModule implements IUIModule {

    public name: string = 'SystemLogUIModule';

    public async unRegister(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public priority: number = 800;

    public async register(): Promise<void> {
        TableFactoryService.getInstance().registerFactory(new LogFileTableFactory());
        LabelService.getInstance().registerLabelProvider(new LogFileLabelProvider());
        ServiceRegistry.registerServiceInstance(LogFileService.getInstance());
        FactoryService.getInstance().registerFactory(KIXObjectType.LOG_FILE, LogFileBrowserFactory.getInstance());

        TableCSSHandlerRegistry.getInstance().registerObjectCSSHandler(
            KIXObjectType.LOG_FILE, new LogFileTableCSSHandler()
        );
    }

}
