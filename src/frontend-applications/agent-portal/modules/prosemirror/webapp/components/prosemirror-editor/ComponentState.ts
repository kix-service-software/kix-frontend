import { IdService } from '../../../../../model/IdService';
import { AbstractComponentState } from '../../../../base-components/webapp/core/AbstractComponentState';

export class ComponentState extends AbstractComponentState {
    public constructor(public editorId: string = IdService.generateDateBasedId('editor-')) {
        super();
    }
}