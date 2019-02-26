import { Label } from "../components";

export class FormInputAction {

    public constructor(
        public id: string,
        public label: Label,
        public callback: (action: FormInputAction) => void,
        public active: boolean = false
    ) { }

}
