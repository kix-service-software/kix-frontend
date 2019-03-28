import { Label, AbstractComponentState } from "../../../../core/browser/components";

export class ComponentState extends AbstractComponentState {

    public constructor(
        public displayCriteria: Array<[string, string, Label[]]> = [],
        public title: string = null
    ) {
        super();
    }

}
