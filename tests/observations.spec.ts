import { test, expect } from '@playwright/test';

const SERIESNAME = 'FXCADAUD';
const FORMAT = 'json';
const RECENTWEEKS = 10;

test(`should return the average of observations for last ${RECENTWEEKS} weeks`, async ({ request }) => {  
  const response = await request.get(`/valet/observations/${SERIESNAME}/${FORMAT}`, {
    params: {
      "recent_weeks": RECENTWEEKS
    }
  });
  
  // Validates a successful response
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/json");

    // Validates internal objects of the response body are not empty
  const responseBody = await response.json();
  expect(responseBody.terms).toBeTruthy();
  expect(responseBody.seriesDetail).toBeTruthy();
  expect(responseBody.observations).toBeTruthy();

  // We expect at least 1 observation in the last weeks
  const currentObservations = responseBody.observations.length;
  expect(currentObservations).toBeGreaterThan(0);

  const sumForexRate = responseBody.observations.reduce((sum, forexRate) => sum + parseFloat(forexRate[SERIESNAME].v), 0);
  console.log(`Average of observations for the last ${RECENTWEEKS} ${RECENTWEEKS == 1 ? 'week' : 'weeks'} ${(sumForexRate/currentObservations).toFixed(4)}`)

});
