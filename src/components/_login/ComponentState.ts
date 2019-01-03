import { ReleaseInfo } from "../../core/model";

export class ComponentState {

    public constructor(
        public loading: boolean = true,
        public valid: boolean = false,
        public error: boolean = false,
        public doLogin: boolean = false,
        public logout: boolean = false,
        public releaseInfo: ReleaseInfo = null
    ) { }

}
