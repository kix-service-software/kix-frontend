import { ConfiguredDialogWidget, ObjectIcon } from '../../../../core/model';

export class ComponentState {

    public constructor(
        public show: boolean = false,
        public dialogWidgets: ConfiguredDialogWidget[] = [],
        public dialogHint: string = '',
        public isLoading: boolean = false,
        public loadingHint: string = '',
        public contextId: string = null,
        public dialogId: string = null,
        public dialogTitle: string = null,
        public dialogIcon: string | ObjectIcon = null,
        public showClose: boolean = false,
        public time: number = null,
        public cancelCallback: () => void = null
    ) { }

}
