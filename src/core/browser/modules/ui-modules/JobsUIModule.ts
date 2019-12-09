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
import { KIXObjectType, ContextDescriptor, ContextMode, ContextType } from "../../../model";
import { LabelService } from "../../LabelService";
import {
    JobService, JobLabelProvider, JobTableFactory, JobBrowserFactory, JobCreateAction, NewJobDialogContext,
    JobFormService, JobDetailsContext, MacroActionLabelProvider, EditJobDialogContext, JobEditAction, JobExecuteAction
} from "../../job";
import { TableFactoryService } from "../../table";
import { FactoryService } from "../../kix";
import { ActionFactory } from "../../ActionFactory";
import { ContextService } from "../../context";
import { JobFilterTableFactory } from "../../job/table/JobFilterTableFactory";
import { MacroActionTableFactory } from "../../job/table/MacroActionTableFactory";

export class UIModule implements IUIModule {

    public priority: number = 500;

    public name: string = 'JobsUIModule';

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
