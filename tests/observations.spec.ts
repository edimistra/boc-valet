import { test, expect, APIResponse } from '@playwright/test';
import { getAVGRate, extractLabel } from '../util/observations';

const SERIESNAME = 'FXCADAUD';
const FORMAT = 'json';
const RECENTWEEKS = 10;

test.describe(`Observation tests for the last ${RECENTWEEKS} weeks`, () => {
  let response: APIResponse;

  test.beforeEach(async({ request }) => {
      response = await request.get(`/valet/observations/${SERIESNAME}/${FORMAT}`, {
      params: {
        "recent_weeks": RECENTWEEKS
      }
    });
  });

  test(`should return the average of observations for last ${RECENTWEEKS} weeks`, async () => {    
    // Validates a successful response
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/json");

    // Validates internal objects of the response body are not empty
    const responseBody = await response.json();
    expect(responseBody.terms.url).toBeTruthy();
    expect(responseBody.seriesDetail).toBeTruthy();
    expect(responseBody.observations).toBeTruthy();

    // We expect at least 1 observation in the last weeks
    const currentObservations = responseBody.observations.length;
    expect(currentObservations).toBeGreaterThan(0);

    // Log the AVG rate for the last weeks
    const avgForexRate = getAVGRate(responseBody.observations, SERIESNAME);
    console.log(`Average of observations for the last ${RECENTWEEKS} ${RECENTWEEKS == 1 ? 'week' : 'weeks'} ${avgForexRate.toFixed(4)}`);
  });

  test('seriesDetail object should contain valid info', async () => {
    // Performs several validations on the seriesDetail object
    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();
    expect(responseBody.seriesDetail[SERIESNAME]).toBeTruthy();
    const seriesLabel = extractLabel(SERIESNAME);
    expect(responseBody.seriesDetail[SERIESNAME].label).toContain(seriesLabel);
    expect(responseBody.seriesDetail[SERIESNAME].description).toBeTruthy();
    expect(responseBody.seriesDetail[SERIESNAME].dimension.key).toBeTruthy();
    expect(responseBody.seriesDetail[SERIESNAME].dimension.name).toBeTruthy();
  });

  test('observations object should contain valid info', async () => {
    // Performs several validations on the obseervation object
    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();
    const observationKey = responseBody.seriesDetail[SERIESNAME].dimension.key;
    // Performs validations on all observations
    responseBody.observations.forEach(observation => {
      // Observation date key matches seriesDetail dimension key
      expect(observation[observationKey]).toBeTruthy();
      // Validates correct date format
      expect(observation.d).toMatch(/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/);
      // All observations have the same series name
      expect(observation[SERIESNAME]).toBeTruthy();
      expect(parseFloat(observation[SERIESNAME].v)).toBeGreaterThan(0);
    });
  });
});

test.describe(`Negative tests for the observations of the last ${RECENTWEEKS} weeks`, () => {
  test('Should reject invalid series name', async ({ request }) => {
    const response = await request.get(`/valet/observations/${RECENTWEEKS}/${FORMAT}`);
    expect(response.status()).toBe(404);
    const responseBody = await response.json();
    expect(responseBody.message).toMatch(`Series ${RECENTWEEKS} not found.`)
  });

  test('Should reject invalid path variable format', async ({ request }) => {
    const response = await request.get(`/valet/observations/${SERIESNAME}/${RECENTWEEKS}`);
    expect(response.status()).toBe(400);
    const responseBody = await response.json();
    expect(responseBody.message).toMatch(`Bad output format (${RECENTWEEKS}) requested.`)
  });

  test('Should reject invalid star_date format', async ({ request }) => {
    const response = await request.get(`/valet/observations/${SERIESNAME}/${FORMAT}`, {
      params: {
        "start_date": RECENTWEEKS
      }
    });
    expect(response.status()).toBe(400);
    const responseBody = await response.json();
    expect(responseBody.message).toMatch("Start date contains a value that is not allowed. Expected format is YYYY-MM-DD, e.g. 2001-01-27")
  });

  test('Should reject invalid end_date format', async ({ request }) => {
    const response = await request.get(`/valet/observations/${SERIESNAME}/${FORMAT}`, {
      params: {
        "end_date": RECENTWEEKS
      }
    });
    expect(response.status()).toBe(400);
    const responseBody = await response.json();
    expect(responseBody.message).toMatch("End date contains a value that is not allowed. Expected format is YYYY-MM-DD, e.g. 2001-01-27")
  });

  test('Cannot mix start_date with any of the recent parameters', async ({ request }) => {
    const response = await request.get(`/valet/observations/${SERIESNAME}/${FORMAT}`, {
      params: {
        "start_date": '2024-01-01',
        "recent": 10
      }
    });
    expect(response.status()).toBe(400);
    const responseBody = await response.json();
    expect(responseBody.message).toMatch("Bad recent observations request parameters, you can not mix start_date or end_date with any of recent, recent_weeks, recent_months, recent_years");
  });

  test('Cannot mix end_date with any of the recent parameters', async ({ request }) => {
    const response = await request.get(`/valet/observations/${SERIESNAME}/${FORMAT}`, {
      params: {
        "end_date": '2024-01-01',
        "recent_months": 10
      }
    });
    expect(response.status()).toBe(400);
    const responseBody = await response.json();
    expect(responseBody.message).toMatch("Bad recent observations request parameters, you can not mix start_date or end_date with any of recent, recent_weeks, recent_months, recent_years");
  });

  test('Should specify only one of the recent parameters', async ({ request }) => {
    const response = await request.get(`/valet/observations/${SERIESNAME}/${FORMAT}`, {
      params: {
        "end_date": '2024-01-01',
        "recent_months": 10
      }
    });
    expect(response.status()).toBe(400);
    const responseBody = await response.json();
    expect(responseBody.message).toMatch("Bad recent observations request parameters, you can not mix start_date or end_date with any of recent, recent_weeks, recent_months, recent_years");
  });

  test('Should reject negative recent values', async ({ request }) => {
    const response = await request.get(`/valet/observations/${SERIESNAME}/${FORMAT}`, {
      params: {
        "recent_years": -1
      }
    });
    expect(response.status()).toBe(400);
    const responseBody = await response.json();
    expect(responseBody.message).toMatch("Bad recent observations request parameters, you cannot have a recent value less than one");
  });

  test('Should reject non numeric recent values', async ({ request }) => {
    const response = await request.get(`/valet/observations/${SERIESNAME}/${FORMAT}`, {
      params: {
        "recent_weeks": "ten"
      }
    });
    expect(response.status()).toBe(400);
    const responseBody = await response.json();
    expect(responseBody.message).toMatch("Bad recent observations request parameters, must be numeric");
  });

  test('Should reject non valid sorting parameters', async ({ request }) => {
    const response = await request.get(`/valet/observations/${SERIESNAME}/${FORMAT}`, {
      params: {
        "order_dir": "ascending"
      }
    });
    expect(response.status()).toBe(400);
    const responseBody = await response.json();
    expect(responseBody.message).toMatch("Bad order direction parameter, must be asc or desc");
  });

});
