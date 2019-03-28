import { AbstractComponentState } from "../../../../../core/browser";

export class ComponentState extends AbstractComponentState {

    public constructor(
        public loading: boolean = false,
        public formId: string = 'new-config-item-class-form'
    ) {
        super();
    }

}
