import { FormField } from "@kix/core/dist/model";

export class ComponentState {

    public constructor(
        public level: number = 0,
        public fields: FormField[] = []
    ) { }

}
