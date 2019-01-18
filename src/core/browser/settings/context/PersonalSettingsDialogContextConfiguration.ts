import { ContextConfiguration } from '../../../model/components/context/ContextConfiguration';
import { PersonalSettingsDialogContext } from './PersonalSettingsDialogContext';

export class PersonalSettingsDialogContextConfiguration extends ContextConfiguration {

    public constructor() {
        super(PersonalSettingsDialogContext.CONTEXT_ID, [], [], [], [], []);
    }

}
