import { ObjectIcon } from '../../../core/model';

export class ComponentState {

    public constructor(
        public fileName: string = null,
        public fileSize: string = null,
        public icon: string | ObjectIcon = null
    ) { }

}
