/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from "../../application/IUIModule";
import { ServiceRegistry } from "../..";
import { CRUD, KIXObjectType } from "../../../model";
import { AuthenticationSocketClient } from "../../application/AuthenticationSocketClient";
import { UIComponentPermission } from "../../../model/UIComponentPermission";
import { LabelService } from "../../LabelService";
import { JobService, JobLabelProvider, JobTableFactory, JobBrowserFactory } from "../../job";
import { TableFactoryService } from "../../table";
import { FactoryService } from "../../kix";

export class UIModule implements IUIModule {

    public priority: number = 500;

    public async unRegister(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async register(): Promise<void> {
        ServiceRegistry.registerServiceInstance(JobService.getInstance());
        FactoryService.getInstance().registerFactory(KIXObjectType.JOB, JobBrowserFactory.getInstance());
        LabelService.getInstance().registerLabelProvider(new JobLabelProvider());
        TableFactoryService.getInstance().registerFactory(new JobTableFactory());
    }

    private async checkPermission(resource: string, crud: CRUD): Promise<boolean> {
        return await AuthenticationSocketClient.getInstance().checkPermissions(
            [new UIComponentPermission(resource, [crud])]
        );
    }

}
