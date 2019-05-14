import { Organisation } from "../../../core/model";

export class ComponentState {

    public constructor(
        public organisation: Organisation = null,
        public error: any = null,
        public properties: string[] = []
    ) { }

}
