import { Context } from '../../../../../model/Context';
import { AbstractComponentState } from '../../core/AbstractComponentState';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public contextList: Context[] = []
    ) {
        super();
    }

}