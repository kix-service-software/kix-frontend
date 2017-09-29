import { IChartValue } from './IChartValue';

export class ChartSingleValue implements IChartValue {
    public value: any;

    public constructor(value: any) {
        this.value = value;
    }
}
