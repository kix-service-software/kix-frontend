/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IMigration } from './IMigration';
import { ReleaseInfoUtil } from '../../../server/ReleaseInfoUtil';
import { LoggingService } from '../../../server/services/LoggingService';
import { ConfigurationService } from '../../../server/services/ConfigurationService';
import { PluginService } from '../../../server/services/PluginService';
import { AgentPortalExtensions } from '../server/extensions/AgentPortalExtensions';

export class MigrationService {

    private static INSTANCE: MigrationService;

    public static getInstance(): MigrationService {
        if (!MigrationService.INSTANCE) {
            MigrationService.INSTANCE = new MigrationService();
        }
        return MigrationService.INSTANCE;
    }

    private constructor() { }

    public async startMigration(): Promise<boolean> {
        const serverConfig = ConfigurationService.getInstance().getServerConfiguration();
        const releaseInfo = await ReleaseInfoUtil.getInstance().getReleaseInfo();

        const migrations = await PluginService.getInstance().getExtensions<IMigration>(AgentPortalExtensions.MIGRATION);

        const migrationsList = migrations.filter(
            (m) => m.buildNumber > serverConfig.INSTALLED_BUILD && m.buildNumber <= releaseInfo.buildNumber
        ).sort((a, b) => a.buildNumber - b.buildNumber);

        let failed = false;
        for (const migration of migrationsList) {
            LoggingService.getInstance().info(`Execute migration: ${migration.name}`);
            await migration.migrate().catch((e) => {
                LoggingService.getInstance().error('Migration process failed.', e);
                failed = true;
            });

            if (failed) {
                return false;
            }

            LoggingService.getInstance().info(`Execute migration: (success) ${migration.name}`);
        }

        return true;
    }

}
