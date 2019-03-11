import { ReleaseInfo } from '../../../core/model';

export class ComponentState {

    public constructor(
        public kixVersion: string = null,
        public kixProduct: string = null,
        public currentUserLogin: string = null,
        public buildNumber: string = null,
        public releaseInfo: ReleaseInfo = null
    ) { }

}
