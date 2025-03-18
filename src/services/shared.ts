/**
 * Shared Services Module
 * 
 * This module maintains singleton instances of services that should be shared
 * across the application to ensure consistent state.
 */

import { createClickUpServices, ClickUpServices } from './clickup/index.js';
import config from '../config.js';
import { Logger } from '../logger.js';

const logger = new Logger('SharedServices');

// Singleton instance
let servicesInstance: ClickUpServices | null = null;

/**
 * Get or create the ClickUp services instance
 */
function getClickUpServices(): ClickUpServices {
  if (!servicesInstance) {
    logger.info('Creating shared ClickUp services singleton');
    
    // Create the services instance
    servicesInstance = createClickUpServices({
      apiKey: config.clickupApiKey,
      teamId: config.clickupTeamId
    });
    
    // Log what services were initialized with more clarity
    logger.info('Services initialization complete', { 
      services: Object.keys(servicesInstance).join(', '),
      teamId: config.clickupTeamId
    });
  }
  return servicesInstance;
}

// Create a single instance of ClickUp services to be shared
export const clickUpServices = getClickUpServices();

// Export individual services for convenience
export const {
  list: listService,
  task: taskService,
  folder: folderService,
  workspace: workspaceService
} = clickUpServices; 