/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ConfigurationType } from '../../../../model/configuration/ConfigurationType';
import { IUIModule } from '../../../../model/IUIModule';
import { ActionFactory } from '../../../../modules/base-components/webapp/core/ActionFactory';
import { CSVExportAction, ImportAction } from './actions';

export class UIModule implements IUIModule {

    public name: string = 'ImportUIModule';

    public async unRegister(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public priority: number = 800;

    public async register(): Promise<void> {
        ActionFactory.getInstance().registerAction('import-action', ImportAction);
        ActionFactory.getInstance().registerAction(
            'csv-export-action', CSVExportAction, [ConfigurationType.TableWidget]
        );
    }

}
