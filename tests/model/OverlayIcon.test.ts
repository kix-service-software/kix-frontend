/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

/* tslint:disable */

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { OverlayIcon } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/OverlayIcon';


chai.use(chaiAsPromised);
const expect = chai.expect;

describe('OverlayIcon', () => {

    describe('Prepare OverlayIcon', () => {

        let overlayIcon: OverlayIcon;

        before(() => {
            overlayIcon = new OverlayIcon(
                undefined, 'test', 'test-content',
                'fas fa-user-slash', undefined, false, true
            );
        });

        it('Have the correct Title', () => {
            expect(overlayIcon.Title).equals('test');
        });

    });
});