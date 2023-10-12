/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from '../../../../model/IUIModule';
import { ServiceRegistry } from '../../../base-components/webapp/core/ServiceRegistry';
import { TableFactoryService } from '../../../table/webapp/core/factory/TableFactoryService';
import { LabelService } from '../../../base-components/webapp/core/LabelService';
import { ImportExportService } from './ImportExportService';
import { ImportExportTemplateLabelProvider } from './ImportExportTemplateLabelProvider';
import { ActionFactory } from '../../../base-components/webapp/core/ActionFactory';
import { TemplateImportAction, TemplateExportAction } from './actions';
import { ImportExportTemplateTableFactory, ImportExportTemplateRunTableFactory } from './table';
import { ImportExportTemplateRunLabelProvider } from './ImportExportTemplateRunLabelProvider';


export class UIModule implements IUIModule {

    public priority: number = 10000;

    public name: string = 'ImportExportUIModule';

    public async unRegister(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public async register(): Promise<void> {
        ServiceRegistry.registerServiceInstance(ImportExportService.getInstance());

        TableFactoryService.getInstance().registerFactory(new ImportExportTemplateTableFactory());
        LabelService.getInstance().registerLabelProvider(new ImportExportTemplateLabelProvider());

        TableFactoryService.getInstance().registerFactory(new ImportExportTemplateRunTableFactory());
        LabelService.getInstance().registerLabelProvider(new ImportExportTemplateRunLabelProvider());

        ActionFactory.getInstance().registerAction('template-import-action', TemplateImportAction);
        ActionFactory.getInstance().registerAction('template-export-action', TemplateExportAction);
    }
}
