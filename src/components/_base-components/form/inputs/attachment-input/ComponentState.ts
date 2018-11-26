import { FormInputComponentState, Attachment } from "@kix/core/dist/model";
import { Label } from "@kix/core/dist/browser/components";

export class ComponentState extends FormInputComponentState<any> {

    public constructor(
        public count: number = 0,
        public dragging: boolean = false,
        public minimized: boolean = false,
        public labels: Label[] = [],
        public multiple: boolean = true
    ) {
        super();
    }
}
