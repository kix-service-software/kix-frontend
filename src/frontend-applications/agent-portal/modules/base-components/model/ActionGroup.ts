import { IdService } from '../../../model/IdService';
import { ObjectIcon } from '../../icon/model/ObjectIcon';
import { IAction } from '../webapp/core/IAction';

export class ActionGroup {

    public key: string;

    public constructor(
        public actions: IAction[] = null,
        public rank: number = null,
        public text: string = null,
        public icon: string | ObjectIcon = null,
    ) {
        this.key = IdService.generateDateBasedId();
    }

}