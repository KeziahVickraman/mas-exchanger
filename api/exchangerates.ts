import type { Request, Response } from 'express';

const MAS_BASE_URL =
  'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_period_daily';

/**
 * Get recent Singapore business date (YYYY-MM-DD)
 * MAS daily exchange rates are published on SG business days around 16:00 SGT.
 */
function getRecentBusinessDay(): string {
  const now = new Date();
  // Convert to Singapore time (UTC+8)
  const sgTime = new Date(now.getTime() + (8 * 60 + now.getTimezoneOffset()) * 60000);
  
  // Go back 1 day to ensure fixing has concluded
  sgTime.setDate(sgTime.getDate() - 1);

  // If Sunday (0), go back to Friday (-2)
  if (sgTime.getDay() === 0) {
    sgTime.setDate(sgTime.getDate() - 2);
  } else if (sgTime.getDay() === 6) {
    // If Saturday (6), go back to Friday (-1)
    sgTime.setDate(sgTime.getDate() - 1);
  }

  const yyyy = sgTime.getFullYear();
  const mm = String(sgTime.getMonth() + 1).padStart(2, '0');
  const dd = String(sgTime.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default async function handler(req: Request | any, res: Response | any) {
  // CORS headers
  if (typeof res.setHeader === 'function') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, KeyId, x-mas-key-id, Authorization');
  }

  if (req.method === 'OPTIONS') {
    if (typeof res.status === 'function') return res.status(200).end();
    res.statusCode = 200;
    return res.end();
  }

  // Extract KeyId without hardcoding
  const keyId =
    process.env.MAS_KEY_ID ||
    (req.headers?.['keyid'] as string) ||
    (req.headers?.['x-mas-key-id'] as string) ||
    (req.headers?.['authorization']?.replace(/^Bearer\s+/i, ''));

  if (!keyId) {
    const errorPayload = {
      error: 'MAS_KEY_ID_MISSING',
      message:
        'MAS_KEY_ID is not configured. Please set MAS_KEY_ID in your environment variables (.env) or pass the KeyId header.',
      configured: false,
      endpointDocumentation: `${MAS_BASE_URL}?end_of_day=YYYY-MM-DD`,
      requiredHeader: 'KeyId: <MAS_KEY_ID>',
    };
    if (typeof res.status === 'function') {
      return res.status(401).json(errorPayload);
    }
    res.statusCode = 401;
    res.setHeader?.('Content-Type', 'application/json');
    return res.end(JSON.stringify(errorPayload));
  }

  // Determine end_of_day date
  const queryDate = req.query?.end_of_day || req.query?.date;
  const endOfDay = (typeof queryDate === 'string' && queryDate.trim()) ? queryDate.trim() : getRecentBusinessDay();

  const targetUrl = `${MAS_BASE_URL}?end_of_day=${encodeURIComponent(endOfDay)}`;

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'KeyId': keyId,
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(8000),
    });

    const contentType = response.headers.get('content-type') || '';
    let responseData: any;

    if (contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      const text = await response.text();
      try {
        responseData = JSON.parse(text);
      } catch {
        responseData = { rawResponse: text };
      }
    }

    if (!response.ok) {
      const upstreamError = {
        error: 'MAS_GATEWAY_ERROR',
        status: response.status,
        statusText: response.statusText,
        requestedUrl: targetUrl,
        upstreamData: responseData,
      };
      if (typeof res.status === 'function') {
        return res.status(response.status).json(upstreamError);
      }
      res.statusCode = response.status;
      res.setHeader?.('Content-Type', 'application/json');
      return res.end(JSON.stringify(upstreamError));
    }

    // Process and normalize MAS record into standard rates per 1 SGD
    const records = responseData?.result?.records || responseData?.records || [];
    const latestRecord = Array.isArray(records) && records.length > 0 ? records[0] : responseData;

    const normalizedRates: Record<string, number> = {};

    if (latestRecord && typeof latestRecord === 'object') {
      // MAS format has fields like:
      // usd_sgd: 1.3450 -> 1 SGD = 1 / 1.3450 USD
      // myr_sgd_100: 30.50 -> 100 MYR = 30.50 SGD -> 1 MYR = 0.3050 SGD -> 1 SGD = 1 / 0.3050 MYR = 3.2787
      // jpy_sgd_100: 0.8850 -> 100 JPY = 0.8850 SGD -> 1 JPY = 0.008850 SGD -> 1 SGD = 1 / 0.008850 JPY = 112.99
      Object.entries(latestRecord).forEach(([key, val]) => {
        const numVal = parseFloat(String(val));
        if (isNaN(numVal) || numVal <= 0) return;

        const lowerKey = key.toLowerCase();

        // 100-unit currencies
        if (lowerKey.includes('_100') || lowerKey.endsWith('100')) {
          const codeMatch = lowerKey.match(/^([a-z]{3})/);
          if (codeMatch) {
            const code = codeMatch[1].toUpperCase();
            // 100 foreign units = numVal SGD
            const rateForOneUnitInSGD = numVal / 100;
            normalizedRates[code] = Number((1 / rateForOneUnitInSGD).toFixed(4));
          }
        } else if (lowerKey.endsWith('_sgd')) {
          const codeMatch = lowerKey.match(/^([a-z]{3})_sgd/);
          if (codeMatch) {
            const code = codeMatch[1].toUpperCase();
            // 1 foreign unit = numVal SGD
            normalizedRates[code] = Number((1 / numVal).toFixed(4));
          }
        }
      });
    }

    const result = {
      source: 'mas-apimg-gw',
      endOfDay,
      requestedUrl: targetUrl,
      rates: normalizedRates,
      rawRecord: latestRecord,
      timestamp: new Date().toISOString(),
    };

    if (typeof res.status === 'function') {
      return res.status(200).json(result);
    }
    res.statusCode = 200;
    res.setHeader?.('Content-Type', 'application/json');
    return res.end(JSON.stringify(result));
  } catch (err: any) {
    const fetchError = {
      error: 'MAS_CONNECTION_FAILED',
      message: err.message || 'Unable to connect to MAS API Gateway',
      requestedUrl: targetUrl,
    };
    if (typeof res.status === 'function') {
      return res.status(502).json(fetchError);
    }
    res.statusCode = 502;
    res.setHeader?.('Content-Type', 'application/json');
    return res.end(JSON.stringify(fetchError));
  }
}
