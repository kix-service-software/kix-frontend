/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from "../../../../model/IUIModule";
import { ServiceRegistry } from "../../../../modules/base-components/webapp/core/ServiceRegistry";
import {
    JobService, JobFormService, JobBrowserFactory, JobLabelProvider, MacroActionLabelProvider,
    JobTableFactory, JobDetailsContext, JobExecuteAction, JobCreateAction, NewJobDialogContext,
    JobEditAction, EditJobDialogContext
} from ".";
import { FactoryService } from "../../../../modules/base-components/webapp/core/FactoryService";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { LabelService } from "../../../../modules/base-components/webapp/core/LabelService";
import { TableFactoryService } from "../../../base-components/webapp/core/table";
import { JobFilterTableFactory } from "./table/JobFilterTableFactory";
import { MacroActionTableFactory } from "./table/MacroActionTableFactory";
import { ContextDescriptor } from "../../../../model/ContextDescriptor";
import { ContextType } from "../../../../model/ContextType";
import { ContextMode } from "../../../../model/ContextMode";
import { ContextService } from "../../../../modules/base-components/webapp/core/ContextService";
import { ActionFactory } from "../../../../modules/base-components/webapp/core/ActionFactory";


export class UIModule implements IUIModule {

    public priority: number = 402;

    public name: string = 'JobUIModule';

    public async unRegister(): Promise<void> {
        throw new Error("Method not implemented.");
    }


    public async register(): Promise<void> {
        ServiceRegistry.registerServiceInstance(JobService.getInstance());
        ServiceRegistry.registerServiceInstance(JobFormService.getInstance());

        FactoryService.getInstance().registerFactory(KIXObjectType.JOB, JobBrowserFactory.getInstance());

        LabelService.getInstance().registerLabelProvider(new JobLabelProvider());
        LabelService.getInstance().registerLabelProvider(new MacroActionLabelProvider());

        TableFactoryService.getInstance().registerFactory(new JobTableFactory());
        TableFactoryService.getInstance().registerFactory(new JobFilterTableFactory());
        TableFactoryService.getInstance().registerFactory(new MacroActionTableFactory());

        const jobDetailsContext = new ContextDescriptor(
            JobDetailsContext.CONTEXT_ID, [KIXObjectType.JOB],
            ContextType.MAIN, ContextMode.DETAILS,
            true, 'object-details-page', ['jobs'], JobDetailsContext
        );
        await ContextService.getInstance().registerContext(jobDetailsContext);

        ActionFactory.getInstance().registerAction('job-execute-action', JobExecuteAction);

        ActionFactory.getInstance().registerAction('job-create-action', JobCreateAction);
        const newJobDialogContext = new ContextDescriptor(
            NewJobDialogContext.CONTEXT_ID, [KIXObjectType.JOB],
            ContextType.DIALOG, ContextMode.CREATE_ADMIN,
            false, 'new-job-dialog', ['jobs'], NewJobDialogContext
        );
        await ContextService.getInstance().registerContext(newJobDialogContext);

        ActionFactory.getInstance().registerAction('job-edit-action', JobEditAction);
        const editJobDialogContext = new ContextDescriptor(
            EditJobDialogContext.CONTEXT_ID, [KIXObjectType.JOB],
            ContextType.DIALOG, ContextMode.EDIT_ADMIN,
            false, 'edit-job-dialog', ['jobs'], EditJobDialogContext
        );
        await ContextService.getInstance().registerContext(editJobDialogContext);
    }

}
