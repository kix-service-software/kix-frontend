import { FormInputComponentState, ObjectIcon, } from "@kix/core/dist/model";

export class ComponentState extends FormInputComponentState<any> {

    public constructor(
        public dragging: boolean = false,
        public icon: string | ObjectIcon = null,
        public title: string = null
    ) {
        super();
    }
}
