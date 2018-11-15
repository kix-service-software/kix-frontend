import { FormInputComponentState, CreateLinkDescription } from "@kix/core/dist/model";
import { Label } from "@kix/core/dist/browser/components";

export class ComponentState extends FormInputComponentState<CreateLinkDescription[]> {

    public constructor(
        public linkDescriptions: CreateLinkDescription[] = [],
        public minimized: boolean = false,
        public labels: Label[] = [],
        public loading: boolean = false
    ) {
        super();
    }

}
