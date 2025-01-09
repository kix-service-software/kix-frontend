/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from '../../../../model/IUIModule';
import { ServiceRegistry } from '../../../../modules/base-components/webapp/core/ServiceRegistry';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { LabelService } from '../../../../modules/base-components/webapp/core/LabelService';
import { TableFactoryService } from '../../../table/webapp/core/factory/TableFactoryService';
import { JobFilterTableFactory } from './table/JobFilterTableFactory';
import { ContextDescriptor } from '../../../../model/ContextDescriptor';
import { ContextType } from '../../../../model/ContextType';
import { ContextMode } from '../../../../model/ContextMode';
import { ContextService } from '../../../../modules/base-components/webapp/core/ContextService';
import { ActionFactory } from '../../../../modules/base-components/webapp/core/ActionFactory';
import { JobTypes } from '../../model/JobTypes';
import { SyncJobFormManager } from './SyncJobFormManager';
import { JobRunHistoryTableFactory } from './table/JobRunHistoryTableFactory';
import { JobRunLabelProvider } from './JobRunLabelProvider';
import { JobRunLogLabelProvider } from './JobRunLogLabelProvider';
import { JobTableDeleteAction } from './actions/JobTableDeleteAction';
import { JobRunLogTableFactory } from './table/JobRunLogTableFactory';
import { UIComponentPermission } from '../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../server/model/rest/CRUD';
import { JobTypeLabelProvider } from './JobTypeLabelProvider';
import { JobFormService } from './JobFormService';
import { JobLabelProvider } from './JobLabelProvider';
import { JobService } from './JobService';
import { JobCreateAction } from './actions/JobCreateAction';
import { JobEditAction } from './actions/JobEditAction';
import { JobExecuteAction } from './actions/JobExecuteAction';
import { EditJobDialogContext } from './context/EditJobDialogContext';
import { JobDetailsContext } from './context/JobDetailsContext';
import { NewJobDialogContext } from './context/NewJobDialogContext';
import { JobTableFactory } from './table/JobTableFactory';
import { JobMacroActionTableFactory } from './table/JobMacroActionTableFactory';
import { DebugOptionFieldHandler } from './DebugOptionFieldHandler';
import { MacroService } from '../../../macro/webapp/core/MacroService';

export class UIModule implements IUIModule {

    public priority: number = 50000;

    public name: string = 'JobUIModule';

    public async register(): Promise<void> {
        ServiceRegistry.registerServiceInstance(JobService.getInstance());
        ServiceRegistry.registerServiceInstance(JobFormService.getInstance());

        LabelService.getInstance().registerLabelProvider(new JobLabelProvider());
        LabelService.getInstance().registerLabelProvider(new JobTypeLabelProvider());
        LabelService.getInstance().registerLabelProvider(new JobRunLabelProvider());
        LabelService.getInstance().registerLabelProvider(new JobRunLogLabelProvider());

        TableFactoryService.getInstance().registerFactory(new JobTableFactory());
        TableFactoryService.getInstance().registerFactory(new JobFilterTableFactory());
        TableFactoryService.getInstance().registerFactory(new JobRunHistoryTableFactory());
        TableFactoryService.getInstance().registerFactory(new JobRunLogTableFactory());
        TableFactoryService.getInstance().registerFactory(new JobMacroActionTableFactory());

        const jobDetailsContext = new ContextDescriptor(
            JobDetailsContext.CONTEXT_ID, [KIXObjectType.JOB],
            ContextType.MAIN, ContextMode.DETAILS,
            true, 'object-details-page', ['jobs'], JobDetailsContext,
            [
                new UIComponentPermission('system/automation/jobs', [CRUD.READ])
            ],
            'Translatable#Job Details', 'kix-icon-gear'
        );
        ContextService.getInstance().registerContext(jobDetailsContext);

        ActionFactory.getInstance().registerAction('job-execute-action', JobExecuteAction);

        ActionFactory.getInstance().registerAction('job-create-action', JobCreateAction);
        const newJobDialogContext = new ContextDescriptor(
            NewJobDialogContext.CONTEXT_ID, [KIXObjectType.JOB],
            ContextType.DIALOG, ContextMode.CREATE_ADMIN,
            false, 'object-dialog', ['jobs'], NewJobDialogContext,
            [
                new UIComponentPermission('system/automation/jobs', [CRUD.CREATE])
            ],
            'Translatable#New Job', 'kix-icon-gear', JobDetailsContext.CONTEXT_ID,
            undefined, false
        );
        ContextService.getInstance().registerContext(newJobDialogContext);

        ActionFactory.getInstance().registerAction('job-table-delete', JobTableDeleteAction);

        ActionFactory.getInstance().registerAction('job-edit-action', JobEditAction);

        const editJobDialogContext = new ContextDescriptor(
            EditJobDialogContext.CONTEXT_ID, [KIXObjectType.JOB],
            ContextType.DIALOG, ContextMode.EDIT_ADMIN,
            false, 'object-dialog', ['jobs'], EditJobDialogContext,
            [
                new UIComponentPermission('system/automation/jobs', [CRUD.CREATE])
            ],
            'Translatable#Edit Job', 'kix-icon-gear', JobDetailsContext.CONTEXT_ID,
            undefined, false
        );
        ContextService.getInstance().registerContext(editJobDialogContext);

        JobFormService.getInstance().registerJobFormManager(JobTypes.SYNCHRONISATION, new SyncJobFormManager());
    }

    public async registerExtensions(): Promise<void> {
        MacroService.getInstance().registerOptionFieldHandler(new DebugOptionFieldHandler());
    }
}
