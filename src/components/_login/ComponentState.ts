import { ReleaseInfo } from "@kix/core/dist/model";

export class ComponentState {

    public constructor(
        public loading: boolean = true,
        public userName: string = "",
        public password: string = "",
        public valid: boolean = false,
        public error: boolean = false,
        public doLogin: boolean = false,
        public logout: boolean = false,
        public releaseInfo: ReleaseInfo = null
    ) { }

}
