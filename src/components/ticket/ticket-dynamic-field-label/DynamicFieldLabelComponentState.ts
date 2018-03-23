import { DynamicField } from '@kix/core/dist/model';

export class DynamicFieldLabelComponentState {

    public constructor(
        public ticketId: number = null,
        public fieldId: number = null,
        public field: DynamicField = null,
        public value: any = null,
        public displayValue: any = null
    ) { }
}
