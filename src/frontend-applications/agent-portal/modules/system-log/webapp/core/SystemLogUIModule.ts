/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LogFileTableFactory } from './table/LogFileTableFactory';
import { LogFileLabelProvider } from './LogFileLabelProvider';
import { LogFileService } from './LogFileService';
import { IUIModule } from '../../../../model/IUIModule';
import { LabelService } from '../../../../modules/base-components/webapp/core/LabelService';
import { ServiceRegistry } from '../../../../modules/base-components/webapp/core/ServiceRegistry';
import { ContextDescriptor } from '../../../../model/ContextDescriptor';
import { ViewLogFileDialogContext } from './context/ViewLogFileDialogContext';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ContextType } from '../../../../model/ContextType';
import { ContextMode } from '../../../../model/ContextMode';
import { UIComponentPermission } from '../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../server/model/rest/CRUD';
import { ContextService } from '../../../base-components/webapp/core/ContextService';
import { LogFileTableCSSHandler } from './table/LogFileTableCSSHandler';
import { TableCSSHandlerRegistry } from '../../../table/webapp/core/css-handler/TableCSSHandlerRegistry';
import { TableFactoryService } from '../../../table/webapp/core/factory/TableFactoryService';

export class UIModule implements IUIModule {

    public name: string = 'SystemLogUIModule';

    public priority: number = 800;

    public async register(): Promise<void> {
        TableFactoryService.getInstance().registerFactory(new LogFileTableFactory());
        LabelService.getInstance().registerLabelProvider(new LogFileLabelProvider());
        ServiceRegistry.registerServiceInstance(LogFileService.getInstance());

        const logFileViewContext = new ContextDescriptor(
            ViewLogFileDialogContext.CONTEXT_ID, [KIXObjectType.LOG_FILE],
            ContextType.DIALOG, ContextMode.DETAILS,
            false, 'system-admin-logfile-view', null, ViewLogFileDialogContext,
            [
                new UIComponentPermission('system/logs', [CRUD.READ])
            ],
            'Translatable#View Log File', 'kix-icon-eye',
            undefined, undefined, false
        );
        ContextService.getInstance().registerContext(logFileViewContext);

        TableCSSHandlerRegistry.getInstance().registerObjectCSSHandler(
            KIXObjectType.LOG_FILE, new LogFileTableCSSHandler()
        );
    }

    public async registerExtensions(): Promise<void> {
        return;
    }

}
