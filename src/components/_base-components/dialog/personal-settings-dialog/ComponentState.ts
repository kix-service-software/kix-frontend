import { AbstractComponentState } from "../../../../core/browser";

export class ComponentState extends AbstractComponentState {

    public constructor(
        public loading: boolean = true,
        public formId: string = null
    ) {
        super();
    }

}
