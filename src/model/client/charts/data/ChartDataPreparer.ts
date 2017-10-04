import { ChartComplexValue } from './ChartComplexValue';
import { ChartDataRow } from './ChartDataRow';
import { ChartSingleValue } from './ChartSingeValue';

/**
 * Class to prepare the chart data.
 *
 * The class provides methods to get consistent data for charts.
 */
export class ChartDataPreparer {

    /**
     * Returns the consistent data
     *
     * @param input TODO: have to be defined
     *
     * @return the prepared data - an array of {@link ChartDataRow}
     */
    public static getData(input: any): ChartDataRow[] {
        let ChartData: ChartDataRow[] = [];

        // TODO: just exsamples
        if (input === 'pie' || input === 'bar') {
            ChartData = [
                new ChartDataRow('A', [new ChartSingleValue('15')]),
                new ChartDataRow('B', [new ChartSingleValue('75')]),
                new ChartDataRow('C', [new ChartSingleValue('35')]),
                new ChartDataRow('D', [new ChartSingleValue('5')]),
            ];
        } else {
            ChartData = [
                new ChartDataRow('Allgemein', [
                    new ChartComplexValue('hoch', [new ChartSingleValue('15')]),
                    new ChartComplexValue('mittel', [new ChartSingleValue('65')]),
                    new ChartComplexValue('niedrig', [new ChartSingleValue('20')])
                ]),
                new ChartDataRow('Beobachten', [
                    new ChartComplexValue('hoch', [new ChartSingleValue('25')]),
                    new ChartComplexValue('mittel', [new ChartSingleValue('45')]),
                    new ChartComplexValue('niedrig', [new ChartSingleValue('30')])
                ]),
                new ChartDataRow('Verantwortlich', [
                    new ChartComplexValue('hoch', [new ChartSingleValue('15')]),
                    new ChartComplexValue('mittel', [new ChartSingleValue('30')]),
                    new ChartComplexValue('niedrig', [new ChartSingleValue('55')])
                ]),
            ];
        }

        return ChartData;
    }
}
