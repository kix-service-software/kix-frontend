import { ReleaseInfo } from "@kix/core/dist/model";

export class ComponentState {

    public constructor(
        public kixVersion: string = null,
        public kixProduct: string = null,
        public currentUserLogin: string = null,
        public buildNumber: string = null,
        public releaseInfo: ReleaseInfo = null
    ) { }

}
