import { IChartValue } from './IChartValue';

export class ChartDataRow {
    public label: string;
    public value: IChartValue[];

    public constructor(label: string, value: IChartValue[]) {
        this.label = label;
        this.value = value;
    }
}
