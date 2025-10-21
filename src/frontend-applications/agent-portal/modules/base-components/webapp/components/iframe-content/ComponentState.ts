import { IdService } from '../../../../../model/IdService';
import { AbstractComponentState } from '../../../../base-components/webapp/core/AbstractComponentState';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public frameId: string = IdService.generateDateBasedId('frame-'),
        public calculateHeight: boolean = false
    ) {
        super();
    }

}