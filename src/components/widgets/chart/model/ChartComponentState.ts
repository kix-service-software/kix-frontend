import { ChartConfiguration } from '@kix/core/dist/model/client';

export class ChartComponentState {

    public svgId: string = 'chart-' + Date.now();

    public configuration: ChartConfiguration = new ChartConfiguration();

    public error: string = null;

}
