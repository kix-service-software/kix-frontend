import { AbstractComponentState } from "../../../../../core/browser";

export class ComponentState extends AbstractComponentState {

    public constructor(
        public canSearch: boolean = false,
        public formId: string = null,
    ) {
        super();
    }
}
