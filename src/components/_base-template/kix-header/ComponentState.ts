import { AbstractComponentState } from "../../../core/browser";

export class ComponentState extends AbstractComponentState {

    public constructor(
        public allowNew: boolean = false
    ) {
        super();
    }

}
