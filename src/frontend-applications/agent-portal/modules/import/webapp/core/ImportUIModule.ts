/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ConfigurationType } from '../../../../model/configuration/ConfigurationType';
import { FormConfiguration } from '../../../../model/configuration/FormConfiguration';
import { FormContext } from '../../../../model/configuration/FormContext';
import { IUIModule } from '../../../../model/IUIModule';
import { ActionFactory } from '../../../../modules/base-components/webapp/core/ActionFactory';
import { FormService } from '../../../base-components/webapp/core/FormService';
import { ServiceRegistry } from '../../../base-components/webapp/core/ServiceRegistry';
import { ImportConfig } from '../../model/ImportConfig';
import { KIXObjectTypeImport } from '../../model/KIXObjectTypeImport';
import { CSVExportAction, ImportAction } from './actions';
import { ImportFormService } from './ImportFormService';

export class UIModule implements IUIModule {

    public name: string = 'ImportUIModule';

    public async unRegister(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public priority: number = 800;

    public async register(): Promise<void> {

        ServiceRegistry.registerServiceInstance(ImportFormService.getInstance());

        ActionFactory.getInstance().registerAction('import-action', ImportAction);
        ActionFactory.getInstance().registerAction(
            'csv-export-action', CSVExportAction, [ConfigurationType.TableWidget]
        );

        const form = new FormConfiguration(
            ImportConfig.FORM_ID, 'Import configuration', [], KIXObjectTypeImport.IMPORT, true, FormContext.NEW
        );
        await FormService.getInstance().addForm(form);
    }

}
