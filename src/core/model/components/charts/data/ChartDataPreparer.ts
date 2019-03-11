import { ChartSettings } from '../ChartSettings';
import { ChartComplexValue } from './ChartComplexValue';
import { ChartDataRow } from './ChartDataRow';
import { ChartSingleValue } from './ChartSingeValue';
import { ObjectDataService } from '../../../../browser/ObjectDataService';

/**
 * Class to prepare the chart data.
 *
 * The class provides methods to get consistent data for charts.
 */
export class ChartDataPreparer {

    /**
     * Returns the consistent data
     *
     * @param dataList TODO: muss noch definiert werden (Liste, die die Datenbasis liefert)
     * @param settings object of the chart settings as {@link ChartSettings}
     * @param objectAttributes TODO: muss noch definiert werden (sowas wie: alle verfügbaren Prioritäten und Status,...)
     *
     * @return the prepared data - an array of {@link ChartDataRow}
     */
    public static getData(dataList: object[], settings: ChartSettings): ChartDataRow[] {
        let chartData: ChartDataRow[] = [];

        // TODO: in enum auslagern oder eventuell dann vorhandenes enum nutzen
        const ticketAttributeMapping = {
            PriorityID: 'priorities',
            StateID: 'states'
        };

        // TODO: extensions verwenden
        if (settings.chartType === 'pie' || settings.chartType === 'bar') {
            if (settings.hasOwnProperty('attributes')) {

                const counts: object = {};
                dataList.forEach((element) => {
                    const counterAttribute = element[settings.attributes[0]];
                    if (counterAttribute) {
                        if (counts.hasOwnProperty(counterAttribute)) {
                            counts[counterAttribute]++;
                        } else {
                            counts[counterAttribute] = 1;
                        }
                    }
                });

                const objectData = ObjectDataService.getInstance().getObjectData();
                if (objectData) {
                    const attributeList = objectData[ticketAttributeMapping[settings.attributes[0]]] || [];

                    for (const attr in counts) {
                        if (attr) {
                            const attributeLabel = attributeList.find((el) => el.ID.toString() === attr.toString());
                            if (attributeLabel) {
                                chartData.push(
                                    new ChartDataRow(attributeLabel.Name, [new ChartSingleValue(counts[attr])])
                                );
                            }
                        }
                    }
                }
            }
        } else {
            // TODO: nur Beispieldaten
            chartData = [
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

        return chartData;
    }
}
