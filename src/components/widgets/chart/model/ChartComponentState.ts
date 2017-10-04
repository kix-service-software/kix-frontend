import { ChartConfiguration } from './../../../../model/client/charts/';

export class ChartComponentState {

    public svgId: string = 'chart-' + Date.now();

    public configuration: ChartConfiguration = new ChartConfiguration();

    public error: string = null;

}
