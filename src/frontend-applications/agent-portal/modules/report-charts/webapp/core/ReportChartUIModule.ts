/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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

    public async registerExtensions(): Promise<void> {
        return;
    }

}