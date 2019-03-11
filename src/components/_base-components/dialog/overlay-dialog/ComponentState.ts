import { ObjectIcon } from '../../../../core/model';

export class ComponentState {

    public constructor(
        public show: boolean = false,
        public dialogTemplate: any = null,
        public dialogInput: any = null,
        public title: string = null,
        public icon: string | ObjectIcon = null,
        public loading: boolean = false
    ) { }

}
