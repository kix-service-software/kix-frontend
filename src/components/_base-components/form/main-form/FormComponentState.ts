import { IFormInstance, KIXObjectType } from '../../../../core/model';

export class FormComponentState {

    public constructor(
        public formId: string = null,
        public objectType: KIXObjectType = null,
        public formInstance: IFormInstance = null,
        public isSearchContext: boolean = false,
        public loading: boolean = true,
        public additionalFieldControlsNeeded: boolean = false
    ) { }

}
