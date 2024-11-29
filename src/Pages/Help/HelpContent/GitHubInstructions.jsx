import React from 'react';

const GitHubInstructions = () => {
  return (
    <div className="overflow-y-scroll">
      <h1 className="text-[35px] font-medium mt-2">GitHub</h1>
      <div id="introduction">
      <section className="mb-6">
        <h2 className="text-[25px] font-medium mt-8 mb-[16px]">Instructions</h2>
        <p className="mb-2">You can use our <a href="#" className="text-blue-600 hover:underline">Emittest GitHub Action</a> in order to integrate Emittest with GitHub.</p>
        <p className="mb-2">This GitHub Action creates an Emittest deployment event, triggering any functional tests associated with that deployment and waiting for their results.</p>
      </section>
      </div>
      <div className="w-full border-t text-[#D6E2FF]"></div>
      <div id="example-workflow">
      <section className="mb-2">
        <h2 className="text-[25px] font-medium mt-8">Example workflow</h2>
        <pre className="bg-gray-100 px-4 pt-2 rounded-lg overflow-x-auto">
          <code>{`
on: [push]

name: emittest

jobs:
  test:
    name: Emittest Functional Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@master
      
      - name: Functional test deployment
        id: emittest_functional_tests
        uses: emittest-technologies/github-run-tests-action@v1.0
        with:
          app_id: \${{ secrets.EMTEST_APP_ID }}
          app_code: \${{ secrets.EMTEST_APP_CODE }}
          api_request: |
            {
              "your-emittest-api-request": "for-starting-a-test-execution"
            }
      # Optional: Use the outputs from test execution in a different step
      - run: |
          echo \${{ steps.emittest_functional_tests.outputs.test_suite }}
          echo \${{ steps.emittest_functional_tests.outputs.configuration }}
          echo \${{ steps.emittest_functional_tests.outputs.test_cases }}
          echo \${{ steps.emittest_functional_tests.outputs.passed }}
          echo \${{ steps.emittest_functional_tests.outputs.failed }}
          echo \${{ steps.emittest_functional_tests.outputs.skipped }}
          echo \${{ steps.emittest_functional_tests.outputs.total_time }}
          echo \${{ steps.emittest_functional_tests.outputs.start_time }}
          echo \${{ steps.emittest_functional_tests.outputs.end_time }}
          echo \${{ steps.emittest_functional_tests.outputs.results }}
          `}</code>
        </pre>
      </section>
      </div>
      <div className="w-full border-t text-[#D6E2FF]"></div>
      <div id="environment-variables">
      <section className="">
        <h2 className="text-[25px] font-medium mt-8 mb-[16px]">Environment variables</h2>
        <ul className="list-disc pl-5 mb-6">
          <li><strong>GITHUB_TOKEN</strong> [string] (optional): The GitHub token for your repository. If provided, the Emittest action will associate a pull request with the deployment if the commit being built is associated with any pull requests. This token is automatically available as a secret in your repo but must be passed in explicitly in order for the action to be able to access it.</li>
        </ul>
      </section>
      </div>
      <div className="w-full border-t text-[#D6E2FF]"></div>
      <div id="inputs">
      <section className="mb-6">
        <h2 className="text-[25px] font-medium mt-8 mb-[16px]">Inputs</h2>
        <ul className="list-disc pl-5">
          <li><strong>app_id</strong> [string]: The App ID for your Emittest account (available here).</li>
          <li><strong>app_code</strong> [string]: The App Code for your Emittest account (available here).</li>
          <li><strong>api_request</strong> [string]: The Emittest API request.</li>
          <li><strong>number_of_retries</strong> [int32]: The number of times the API request for fetching the results will be sent once every 30 seconds.</li>
        </ul>
      </section>
      </div>
      <div className="w-full border-t text-[#D6E2FF]"></div>
      <div id='outputs'>
      <section>
        <h2 className="text-[25px] font-medium mt-8 mb-[16px]">Outputs</h2>
        <ul className="list-disc pl-5">
          <li><strong>test_suite</strong> [string]: The name of the test suite.</li>
          <li><strong>configuration</strong> [string]: The configuration of the machine or mobile device on which the test was executed.</li>
          <li><strong>test_cases</strong> [int32]: The number of test cases.</li>
          <li><strong>passed</strong> [int32]: The number of assertions that have passed.</li>
          <li><strong>failed</strong> [int32]: The number of assertions that have failed.</li>
        </ul>
      </section>
      <div className="mb-8"></div>  
    </div>
    </div>
  );
};

export default GitHubInstructions;