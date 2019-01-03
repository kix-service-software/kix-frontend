import { Attachment, Article, ObjectIcon } from '../../../core/model';

export class ComponentState {

    public constructor(
        public article: Article = null,
        public attachment: Attachment = null,
        public progress: boolean = false,
        public extension: string = null,
        public icon: ObjectIcon = null
    ) { }

}
