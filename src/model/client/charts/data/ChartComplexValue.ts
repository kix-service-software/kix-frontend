import { IChartValue } from './IChartValue';

export class ChartComplexValue implements IChartValue {
    public label: string;
    public value: IChartValue;

    public constructor(label: string, value: any) {
        this.label = label;
        this.value = value;
    }
}
