import { AbstractComponentState } from "../../../core/browser";

export class ComponentState extends AbstractComponentState {

    public constructor(
        public cancelCallback: () => void = null,
        public cancel: boolean = false,
        public time: number = null
    ) {
        super();
    }

}
