import { FormInputComponentState, CreateLinkDescription } from "../../../../../core/model";
import { Label } from "../../../../../core/browser/components";

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
