import { FormInputComponentState, Attachment } from "../../../../../core/model";
import { Label } from "../../../../../core/browser/components";

export class ComponentState extends FormInputComponentState<any> {

    public constructor(
        public count: number = 0,
        public dragging: boolean = false,
        public minimized: boolean = false,
        public labels: Label[] = [],
        public multiple: boolean = true,
        public accept: string = null,
    ) {
        super();
    }
}
