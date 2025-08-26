import { IdService } from '../../../../../model/IdService';
import { FormInputComponentState } from '../../core/FormInputComponentState';

export class ComponentState extends FormInputComponentState {

    public constructor(
        public title: string = 'initial-site-url-select-input Component',
        public treeId: string = IdService.generateDateBasedId('initial-site-url-select-input-'),
        public prepared: boolean = false,
    ) {
        super();
    }

}