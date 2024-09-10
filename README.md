# boc-valet
Test Automation coding challenge with Playwright

## Installing Playwright
    `npm init playwright@latest`


If using VSCode you can follow the instructions on:
https://playwright.dev/docs/getting-started-vscode

## Running the tests:
- To run the tests using from the command line
    
    `npm run test`

- To run the tests in UI mode

    `npm run test-ui`

## Folder Structure
```
boc-valet
├── README.md
├── node_modules
├── package-lock.json
├── package.json
├── playwright-report
├── playwright.config.ts
├── test-results
├── tests
│   └── observations.spec.ts
└── util
    └── observations.ts
```

## playwright.config.ts
Only configuration used is `baseURL` to share the API URL among all the tests.
```
baseURL: 'https://www.bankofcanada.ca',
    extraHTTPHeaders: {
      'Accept': 'application/json',
    },
```

## Common functions (util)
`observations.ts` contain functions such as `getAVGRate()` and `extractLabel()` that can be reused among different tests. Also, by keeping these functions separated from the tests, readability is improved and tests focus on high level interactions with API leaving complex operations to modules.

## Observations tests

The goal of these tests is to guarantee the reliable execution of the daily exchange rate observations in the last 10 weeks. It calculates the average rate for the last 10 weeks and on top of that it performs several validations on the response body to check its integrity.

It also adds negative tests scenarios that exercises empty and invalid values for both path and query parameters.

#### What could have I done if I had more time?

- I would have added more negative tests to validate most combinations of start_date and end_date, the recent paramenters, and sorting.
- I would have improved the data patametrization to make the test more scalable and maintainable. At the moment in order to update test data such as the seriesNames or the number of recent weeks, it is necessary to modify the values on the test script.
- I would probably use Faker.js for generating random test data
- I would add the error message validation texts into test data variables to improve maintainabilit in the long term.
- I would have tuned the script to optimize it for parallel execution
- I would have explored other types of testing such as performance and load testing

## HTML Report
On every run a HTML report is generated, the file `ortoni-report.html` has to be opened from the Finder.