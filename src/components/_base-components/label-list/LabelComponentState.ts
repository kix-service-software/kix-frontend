import { Label } from '../../../core/browser/components';

export class LabelComponentState {

    public constructor(
        public labels: Label[] = [],
        public removeLabels: boolean = true
    ) { }

}
