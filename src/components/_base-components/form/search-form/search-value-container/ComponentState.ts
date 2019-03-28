import { TreeNode } from '../../../../../core/model';
import { FormSearchValue } from './FormSearchValue';
import { AbstractComponentState } from '../../../../../core/browser';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public propertyNodes: TreeNode[] = [],
        public searchValues: FormSearchValue[] = [],
    ) {
        super();
    }

}
