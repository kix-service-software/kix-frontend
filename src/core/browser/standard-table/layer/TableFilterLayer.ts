import { ITableFilterLayer, TableRow } from '..';
import { KIXObject, KIXObjectPropertyFilter, TableFilterCriteria } from '../../../model';
import { AbstractTableLayer } from './AbstractTableLayer';
import { SearchOperator } from '../../SearchOperator';
import { ContextService } from '../../context';
import { ServiceRegistry, KIXObjectService } from '../../kix';
import { LabelService } from '../../LabelService';

export class TableFilterLayer extends AbstractTableLayer implements ITableFilterLayer {

    private filteredRows: TableRow[] = [];

    private textFilterValue: string;
    private additionalFilterCriteria: TableFilterCriteria[];

    public constructor() {
        super();
    }

    public async getRows(refresh: boolean = false): Promise<TableRow[]> {
        this.filteredRows = await this.getPreviousLayer().getRows(refresh);
        if (this.additionalFilterCriteria && this.additionalFilterCriteria.length) {
            this.filteredRows = this.filteredRows.filter((row) => {
                return this.checkAdditionalFilterCriteria(this.additionalFilterCriteria, row.object);
            });
        }
        if (this.textFilterValue) {
            const searchValue = this.textFilterValue.toString().toLocaleLowerCase();
            const foundRows = [];
            for (const row of this.filteredRows) {
                for (const value of row.values) {
                    const displayValue
                        = await LabelService.getInstance().getPropertyValueDisplayText(row.object, value.columnId);
                    if (displayValue && displayValue.toString()
                        .toLocaleLowerCase()
                        .toLocaleString()
                        .replace(/\u200E/g, "")
                        .indexOf(searchValue) !== -1
                    ) {
                        foundRows.push(row);
                        break;
                    }
                }
            }
            this.filteredRows = foundRows;
        }
        return this.filteredRows;
    }

    private checkAdditionalFilterCriteria(
        criteria: TableFilterCriteria[], object: KIXObject
    ): boolean {
        return criteria.every((c) => {
            let returnValue = false;

            if (c.value === 'CURRENT_USER') {
                c.value = ContextService.getInstance().getObjectData().currentUser.UserID;
            }

            if (c.useObjectService) {
                returnValue = KIXObjectService.checkFilterValue(object.KIXObjectType, object, c);
            } else {
                const objectValue = object[c.property] || null;
                switch (c.operator) {
                    case SearchOperator.EQUALS:
                        returnValue = objectValue === c.value;
                        break;
                    case SearchOperator.CONTAINS:
                        returnValue = objectValue.toString().toLocaleLowerCase().
                            indexOf(c.value.toString()) !== -1;
                        break;
                    case SearchOperator.LESS_THAN:
                        returnValue = objectValue < c.value;
                    default:
                }
            }
            return returnValue;
        });
    }

    public filter(value: string, filter: KIXObjectPropertyFilter): void {
        this.textFilterValue = value;
        this.additionalFilterCriteria = filter ? filter.criteria : null;

    }

    public reset(): void {
        this.textFilterValue = null;
        this.additionalFilterCriteria = null;
    }
}
