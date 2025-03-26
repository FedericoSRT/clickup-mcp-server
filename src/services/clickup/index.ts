/**
 * ClickUp Service Entry Point
 * 
 * This file re-exports all service modules for the ClickUp API integration.
 * It also provides a convenient factory method to create instances of all services.
 */

// Export base service components
export { 
  BaseClickUpService, 
  ClickUpServiceError, 
  ErrorCode,
  ServiceResponse 
} from './base.js';

// Export type definitions
export * from './types.js';

// Export service modules
export { WorkspaceService } from './workspace.js';
export { TaskService } from './task.js';
export { ListService } from './list.js';
export { FolderService } from './folder.js';
export { ClickUpTagService } from './tag.js';

// Import service classes for the factory function
import { WorkspaceService } from './workspace.js';
import { TaskService } from './task.js';
import { ListService } from './list.js';
import { FolderService } from './folder.js';
import { ClickUpTagService } from './tag.js';
import { Logger } from '../../logger.js';

/**
 * Configuration options for ClickUp services
 */
export interface ClickUpServiceConfig {
  apiKey: string;
  teamId: string;
  baseUrl?: string;
}

/**
 * Collection of all ClickUp service instances
 */
export interface ClickUpServices {
  workspace: WorkspaceService;
  task: TaskService;
  list: ListService;
  folder: FolderService;
  tag: ClickUpTagService;
}

// Singleton logger for ClickUp services
const logger = new Logger('ClickUpServices');

/**
 * Factory function to create instances of all ClickUp services
 * @param config Configuration for the services
 * @returns Object containing all service instances
 */
export function createClickUpServices(config: ClickUpServiceConfig): ClickUpServices {
  const { apiKey, teamId, baseUrl } = config;

  // Log start of overall initialization
  logger.info('Starting ClickUp services initialization', { 
    teamId, 
    baseUrl: baseUrl || 'https://api.clickup.com/api/v2' 
  });

  // Create workspace service first since others depend on it
  logger.info('Initializing ClickUp Workspace service');
  const workspaceService = new WorkspaceService(apiKey, teamId, baseUrl);

  // Initialize remaining services with workspace dependency
  logger.info('Initializing ClickUp Task service');
  const taskService = new TaskService(apiKey, teamId, baseUrl, workspaceService);
  
  logger.info('Initializing ClickUp List service');
  const listService = new ListService(apiKey, teamId, baseUrl, workspaceService);
  
  logger.info('Initializing ClickUp Folder service');
  const folderService = new FolderService(apiKey, teamId, baseUrl, workspaceService);

  logger.info('Initializing ClickUp Tag service');
  const tagService = new ClickUpTagService(apiKey, teamId, baseUrl);

  const services = {
    workspace: workspaceService,
    task: taskService,
    list: listService,
    folder: folderService,
    tag: tagService
  };

  // Log successful completion
  logger.info('All ClickUp services initialized successfully', {
    services: Object.keys(services),
    baseUrl: baseUrl || 'https://api.clickup.com/api/v2'
  });
  
  return services;
} 