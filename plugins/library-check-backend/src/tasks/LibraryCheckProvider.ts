import * as uuid from 'uuid';
import {
  EntityProvider,
  EntityProviderConnection,
} from '@backstage/plugin-catalog-node';
import { DiscoveryService } from '@backstage/backend-plugin-api';
import { PluginTaskScheduler, TaskRunner } from '@backstage/backend-tasks';
import { Logger } from 'winston';
import { LibraryCheckService } from '../service/LibraryCheckService';
import { Config } from '@backstage/config';

// This should get the libraries saved on libraries table
// And fetch on the official registries for new data
export class LibraryCheckProvider implements EntityProvider {
  private readonly logger: Logger;
  private readonly scheduleFn: () => Promise<void>;
  private connection?: EntityProviderConnection;
  private readonly libraryCheckService: LibraryCheckService;
  private readonly envId: string;
  private readonly config: Config;

  constructor(
    config: Config,
    logger: Logger,
    envId: string,
    taskRunner: TaskRunner,
  ) {
    this.scheduleFn = this.createScheduleFn(taskRunner);
    this.logger = logger;
    this.envId = envId;
    this.config = config;
    this.libraryCheckService = new LibraryCheckService();
  }

  static fromConfig(options: {
    config: Config;
    envId: string;
    discovery: DiscoveryService;
    logger: Logger;
    schedule?: TaskRunner;
    scheduler?: PluginTaskScheduler;
  }) {
    if (!options.schedule && !options.scheduler) {
      throw new Error('Either schedule or scheduler must be provided.');
    }

    const taskRunner =
      options.schedule ??
      options.scheduler!.createScheduledTaskRunner({
        frequency: {
          minutes: 5,
        },
        timeout: {
          minutes: 10,
        },
      });

    return new LibraryCheckProvider(
      options.config,
      options.logger,
      options.envId,
      taskRunner,
    );
  }

  private createScheduleFn(taskRunner: TaskRunner): () => Promise<void> {
    return async () => {
      const taskId = `${this.getProviderName()}:refresh`;

      return taskRunner.run({
        id: taskId,
        fn: async () => {
          const logger = this.logger.child({
            class: LibraryCheckProvider.prototype.constructor.name,
            taskId,
            taskInstanceId: uuid.v4(),
          });
          try {
            await this.refresh(logger);
          } catch (error) {
            logger.error(`${this.getProviderName()}: Refresh failed`, error);
          }
        },
      });
    };
  }

  getProviderName(): string {
    return `LibraryCheckProvider:${this.envId}`;
  }

  async connect(connection: EntityProviderConnection): Promise<void> {
    this.connection = connection;
    return await this.scheduleFn();
  }

  async refresh(logger: Logger) {
    if (!this.connection) {
      logger.error(
        `${this.getProviderName()}: Error trying to initialize Provider`,
      );
      return;
    }

    const baseUrl = `${this.config.get('backend.baseUrl')}`;
    const currentTime = new Date();
    const updateTimeT60 = new Date(currentTime.getTime() - 60 * 60 * 1000);

    // TODO: check based on T - provider schedule time
    // For now will retrieve only libs that were not checked before (null) or T - 60 minutes
    const pendingUpdate = await this.libraryCheckService.getLastChecked(
      baseUrl,
      updateTimeT60.toISOString(),
    );

    await this.libraryCheckService.updateLibraries(pendingUpdate, baseUrl);
  }
}
