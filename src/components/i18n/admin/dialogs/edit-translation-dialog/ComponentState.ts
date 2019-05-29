import { AbstractComponentState } from "../../../../../core/browser";

export class ComponentState extends AbstractComponentState {

    public constructor(
        public formId: string = 'edit-translation-form'
    ) {
        super();
    }

}
