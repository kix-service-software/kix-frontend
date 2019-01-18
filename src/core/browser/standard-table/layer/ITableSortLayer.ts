import { ITableLayer } from './ITableLayer';
import { SortOrder } from '../../../model';

export interface ITableSortLayer {

    sort(columnId: string, sortOrder: SortOrder): void;

}
