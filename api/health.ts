import type { Request, Response } from 'express';

export interface HealthResponse {
  status: 'healthy' | 'degraded';
  timestamp: string;
  masKeyConfigured: boolean;
  service: string;
  version: string;
  masEndpoint: string;
}

/**
 * Serverless / Express handler for health checks
 */
export default async function handler(req: Request | any, res: Response | any) {
  const masKeyConfigured = Boolean(process.env.MAS_KEY_ID);

  const payload: HealthResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    masKeyConfigured,
    service: 'mas-singarate-api',
    version: '1.0.0',
    masEndpoint: 'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_period_daily',
  };

  if (typeof res.status === 'function') {
    return res.status(200).json(payload);
  } else if (typeof res.setHeader === 'function') {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    return res.end(JSON.stringify(payload));
  }

  return payload;
}
