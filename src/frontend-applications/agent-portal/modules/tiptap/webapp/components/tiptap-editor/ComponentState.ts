import { AbstractComponentState } from '../../../../base-components/webapp/core/AbstractComponentState';
import { IdService } from '../../../../../model/IdService';

export class ComponentState extends AbstractComponentState {
    public constructor(public editorId: string = IdService.generateDateBasedId('editor-')) {
        super();
    }
}