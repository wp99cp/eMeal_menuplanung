'use server';

import logger from '@/logger';

export async function log_endpoint(logs: any) {
  logger.info(logs);
}
