/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXModuleExtension } from '../../model/IKIXModuleExtension';
import { UIComponent } from '../../model/UIComponent';

import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IKIXModuleExtension {

    public applications: string[] = ['agent-portal'];

    public tags: Array<[string, string]>;

    public id = 'kix-calendar-module';

    public external: boolean = false;

    public initComponents: UIComponent[] = [
        new UIComponent('kix-calendar-component', '/kix-calendar$0/webapp/core/CalendarUIModule', [])
    ];

    public uiComponents: UIComponent[] = [
        new UIComponent('calendar-module', '/kix-calendar$0/webapp/components/calendar-module', []),
        new UIComponent('calendar-widget', '/kix-calendar$0/webapp/components/calendar-widget', []),
        new UIComponent(
            'calendar-schedule-details',
            '/kix-calendar$0/webapp/components/calendar-widget/calendar-schedule-details',
            []
        )
    ];

    public webDependencies: string[] = [
        './calendar/webapp'
    ];

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
