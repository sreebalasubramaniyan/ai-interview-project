// Local Code Execution Service - JavaScript only
// Uses Node.js - completely free, no API needed!

const { execSync, spawn } = require('child_process');

/**
 * Execute code with stdout capture (like LeetCode)
 */
async function executeCodeSimple(sourceCode, language, input) {
  if (language !== 'javascript') {
    return {
      success: false,
      error: `Only JavaScript is supported. Got: ${language}`
    };
  }

  try {
    // Parse input
    let inputObj;
    try {
      inputObj = input ? JSON.parse(input) : {};
    } catch (e) {
      inputObj = input;
    }

    // Create the execution script
    const script = `
const input = ${JSON.stringify(inputObj)};

${sourceCode}

try {
  const result = solution(input);
  console.log('__RESULT__' + JSON.stringify(result) + '__END__');
} catch (e) {
  console.log('__ERROR__' + e.message + '__END__');
}
`;

    // Execute using spawn
    const result = await new Promise((resolve) => {
      let stdout = '';
      let stderr = '';

      const child = spawn('node', ['-e', script]);

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        resolve({
          success: code === 0,
          stdout: stdout,
          stderr: stderr,
          compile_output: '',
          status: code === 0 ? 'OK' : 'Error',
          time: 0,
          memory: 0
        });
      });

      child.on('error', (err) => {
        resolve({
          success: false,
          stdout: '',
          stderr: err.message,
          compile_output: '',
          status: 'Error',
          time: 0,
          memory: 0,
          error: err.message
        });
      });

      // Timeout handler
      setTimeout(() => {
        child.kill();
        resolve({
          success: false,
          stdout: stdout,
          stderr: 'Execution timeout (5s limit)',
          compile_output: '',
          status: 'Timeout',
          time: 0,
          memory: 0,
          error: 'Execution timeout'
        });
      }, 5000);
    });

    return result;

  } catch (error) {
    return {
      success: false,
      stdout: '',
      stderr: error.message,
      compile_output: '',
      status: 'Error',
      time: 0,
      memory: 0,
      error: error.message
    };
  }
}

/**
 * Extract result from output
 */
function extractResult(output) {
  if (!output) return '';

  // Look for __RESULT__ markers
  const resultMatch = output.match(/__RESULT__(.*?)__END__/);
  if (resultMatch) {
    return resultMatch[1];
  }

  // Look for ERROR markers
  const errorMatch = output.match(/__ERROR__(.*?)__END__/);
  if (errorMatch) {
    return '__ERROR__' + errorMatch[1];
  }

  // Otherwise return last non-empty line
  const lines = output.split('\n').filter(l => l.trim());
  return lines[lines.length - 1] || '';
}

/**
 * Run code against multiple test cases
 */
async function executeAllTestCases(sourceCode, language, testCases) {
  const results = [];

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];

    const result = await executeCodeSimple(sourceCode, language, testCase.input);

    // Extract result from output
    const rawOutput = result.stdout;
    let actualOutput = extractResult(rawOutput);

    // Check for errors
    let error = null;
    if (actualOutput.startsWith('__ERROR__')) {
      error = actualOutput.replace('__ERROR__', '').replace('__END__', '');
      actualOutput = '';
    } else if (result.stderr) {
      error = result.stderr;
    }

    // Normalize expected output
    let expectedOutput = testCase.output.trim();
    try {
      // Try to parse as JSON
      const parsed = JSON.parse(expectedOutput);
      expectedOutput = JSON.stringify(parsed);
    } catch (e) {
      // Keep as is if not valid JSON
    }

    // Compare outputs
    let passed = false;
    try {
      const actualParsed = JSON.parse(actualOutput);
      const expectedParsed = JSON.parse(expectedOutput);
      passed = JSON.stringify(actualParsed) === JSON.stringify(expectedParsed);
    } catch (e) {
      // If either is not valid JSON, do string comparison
      passed = actualOutput === expectedOutput;
    }

    results.push({
      testCaseNumber: i + 1,
      input: testCase.input,
      expected: expectedOutput,
      actual: actualOutput,
      stdout: [],
      passed: passed,
      error: error,
      executionTime: result.time || 0,
      memory: result.memory || 0,
      status: result.status
    });
  }

  return results;
}

module.exports = {
  executeCodeSimple,
  executeAllTestCases
};
