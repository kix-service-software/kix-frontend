import { Ticket } from '@kix/core/dist/model';

export class ObjectPropertyLabelComponentState {

    public constructor(
        public object: Ticket = null,
        public property: string = null,
        public hasLabel: boolean = true,
        public hasText: boolean = true,
        public hasIcon: boolean = true
    ) { }

}
