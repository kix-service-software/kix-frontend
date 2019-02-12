import { InlineContent } from '../../../core/browser/components';

export class ComponentState {

    public constructor(
        public content: string = null,
        public inlineContent: InlineContent[] = []
    ) { }
}
