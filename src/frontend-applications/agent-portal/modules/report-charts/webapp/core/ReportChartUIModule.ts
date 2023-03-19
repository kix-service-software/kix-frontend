/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from '../../../../model/IUIModule';
import { ChartWidgetService } from './ChartWidgetService';
import { CSVChartDataMapper } from './CSVChartDataMapper';

export class UIModule implements IUIModule {

    public name: string = 'ChartUIModule';

    public priority: number = 8000;

    public async register(): Promise<void> {
        ChartWidgetService.getInstance().registerChartDataMapper('CSV', new CSVChartDataMapper());
    }

    public async unRegister(): Promise<void> {
        throw new Error('Method not implemented.');
    }

}