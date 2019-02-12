import { StandardTable } from '../../../core/browser';
import { KIXObject } from '../../../core/model';

export class StandardTableInput<T extends KIXObject<T>> {

    public standardTable: StandardTable<T>;

}
