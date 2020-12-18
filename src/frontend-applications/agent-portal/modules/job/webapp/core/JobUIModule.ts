/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from '../../../../model/IUIModule';
import { ServiceRegistry } from '../../../../modules/base-components/webapp/core/ServiceRegistry';
import {
    JobService, JobFormService, JobLabelProvider, MacroActionLabelProvider,
    JobTableFactory, JobDetailsContext, JobExecuteAction, JobCreateAction, NewJobDialogContext,
    JobEditAction, EditJobDialogContext
} from '.';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { LabelService } from '../../../../modules/base-components/webapp/core/LabelService';
import { TableFactoryService } from '../../../base-components/webapp/core/table';
import { JobFilterTableFactory } from './table/JobFilterTableFactory';
import { MacroActionTableFactory } from './table/MacroActionTableFactory';
import { ContextDescriptor } from '../../../../model/ContextDescriptor';
import { ContextType } from '../../../../model/ContextType';
import { ContextMode } from '../../../../model/ContextMode';
import { ContextService } from '../../../../modules/base-components/webapp/core/ContextService';
import { ActionFactory } from '../../../../modules/base-components/webapp/core/ActionFactory';
import { JobTypes } from '../../model/JobTypes';
import { TicketJobFormManager } from './TicketJobFormManager';
import { SyncJobFormManager } from './SyncJobFormManager';
import { JobRunHistoryTableFactory } from './table/JobRunHistoryTableFactory';
import { JobRunLabelProvider } from './JobRunLabelProvider';
import { JobRunLogLabelProvider } from './JobRunLogLabelProvider';
import { JobRunLogTableFactory } from './table/JobRunLogTableFactory';
import { AbstractJobFormManager } from './AbstractJobFormManager';
import { FetchAssetAttributes } from './extended-form-manager/FetchAssetAttributes';
import { TicketArticleCreateBody } from './extended-form-manager/TicketArticleCreateBody';
import { TicketCreateDynamicFields } from './extended-form-manager/TicketCreateDynamicFields';
import { UIComponentPermission } from '../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../server/model/rest/CRUD';
import { FormValidationService } from '../../../base-components/webapp/core/FormValidationService';
import { JobFilterValidator } from './form/validators/JobFilterValidator';

export class UIModule implements IUIModule {

    public priority: number = 402;

    public name: string = 'JobUIModule';

    public async unRegister(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public async register(): Promise<void> {
        ServiceRegistry.registerServiceInstance(JobService.getInstance());
        ServiceRegistry.registerServiceInstance(JobFormService.getInstance());

        LabelService.getInstance().registerLabelProvider(new JobLabelProvider());
        LabelService.getInstance().registerLabelProvider(new MacroActionLabelProvider());
        LabelService.getInstance().registerLabelProvider(new JobRunLabelProvider());
        LabelService.getInstance().registerLabelProvider(new JobRunLogLabelProvider());

        TableFactoryService.getInstance().registerFactory(new JobTableFactory());
        TableFactoryService.getInstance().registerFactory(new JobFilterTableFactory());
        TableFactoryService.getInstance().registerFactory(new MacroActionTableFactory());
        TableFactoryService.getInstance().registerFactory(new JobRunHistoryTableFactory());
        TableFactoryService.getInstance().registerFactory(new JobRunLogTableFactory());

        const jobDetailsContext = new ContextDescriptor(
            JobDetailsContext.CONTEXT_ID, [KIXObjectType.JOB],
            ContextType.MAIN, ContextMode.DETAILS,
            true, 'object-details-page', ['jobs'], JobDetailsContext,
            [
                new UIComponentPermission('system/automation/jobs', [CRUD.READ])
            ]
        );
        ContextService.getInstance().registerContext(jobDetailsContext);

        ActionFactory.getInstance().registerAction('job-execute-action', JobExecuteAction);

        ActionFactory.getInstance().registerAction('job-create-action', JobCreateAction);
        const newJobDialogContext = new ContextDescriptor(
            NewJobDialogContext.CONTEXT_ID, [KIXObjectType.JOB],
            ContextType.DIALOG, ContextMode.CREATE_ADMIN,
            false, 'new-job-dialog', ['jobs'], NewJobDialogContext,
            [
                new UIComponentPermission('system/automation/jobs', [CRUD.CREATE])
            ]
        );
        ContextService.getInstance().registerContext(newJobDialogContext);

        ActionFactory.getInstance().registerAction('job-edit-action', JobEditAction);
        const editJobDialogContext = new ContextDescriptor(
            EditJobDialogContext.CONTEXT_ID, [KIXObjectType.JOB],
            ContextType.DIALOG, ContextMode.EDIT_ADMIN,
            false, 'edit-job-dialog', ['jobs'], EditJobDialogContext,
            [
                new UIComponentPermission('system/automation/jobs', [CRUD.CREATE])
            ]
        );
        ContextService.getInstance().registerContext(editJobDialogContext);

        FormValidationService.getInstance().registerValidator(new JobFilterValidator());
        JobFormService.getInstance().registerJobFormManager(JobTypes.TICKET, new TicketJobFormManager());
        JobFormService.getInstance().registerJobFormManager(JobTypes.SYNCHRONISATION, new SyncJobFormManager());

        const manager = JobFormService.getInstance().getJobFormManager(JobTypes.TICKET);
        if (manager) {
            (manager as AbstractJobFormManager).addExtendedJobFormManager(
                new TicketArticleCreateBody()
            );
            (manager as AbstractJobFormManager).addExtendedJobFormManager(
                new FetchAssetAttributes()
            );
            (manager as AbstractJobFormManager).addExtendedJobFormManager(
                new TicketCreateDynamicFields()
            );
        }
    }

}
