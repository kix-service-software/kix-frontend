import { InlineContent } from '@kix/core/dist/browser/components';

export class ComponentState {

    public constructor(
        public content: string = null,
        public inlineContent: InlineContent[] = []
    ) { }
}
