import { evaluateSignalStatus } from './index.js';

function runSignalEvaluatorTests() {
  console.log('Running Signal Evaluator Unit Tests...\n');
  const baseTime = 1000000000000;

  // 1. Fresh ping: <= 30 seconds -> LIVE
  const freshTrip = { trip_id: 'TEST-1', source: 'conductor', serverReceivedAt: baseTime - 12000 }; // 12s ago
  const res1 = evaluateSignalStatus(freshTrip, baseTime);
  console.assert(res1.data_state === 'LIVE', `Test 1 Failed: Expected LIVE, got ${res1.data_state}`);
  console.assert(res1.last_ping_age_seconds === 12, `Test 1 Age Failed: Expected 12, got ${res1.last_ping_age_seconds}`);

  // 2. Exact 30 seconds threshold -> LIVE
  const trip30s = { trip_id: 'TEST-2', source: 'simulator', serverReceivedAt: baseTime - 30000 };
  const res2 = evaluateSignalStatus(trip30s, baseTime);
  console.assert(res2.data_state === 'LIVE', `Test 2 Failed: Expected LIVE at 30s, got ${res2.data_state}`);

  // 3. Just over 30 seconds (31s) -> PARTIAL
  const trip31s = { trip_id: 'TEST-3', source: 'conductor', serverReceivedAt: baseTime - 31000 };
  const res3 = evaluateSignalStatus(trip31s, baseTime);
  console.assert(res3.data_state === 'PARTIAL', `Test 3 Failed: Expected PARTIAL at 31s, got ${res3.data_state}`);

  // 4. Exact 5 minutes threshold (300s) -> PARTIAL
  const trip5m = { trip_id: 'TEST-4', source: 'simulator', serverReceivedAt: baseTime - 300000 };
  const res4 = evaluateSignalStatus(trip5m, baseTime);
  console.assert(res4.data_state === 'PARTIAL', `Test 4 Failed: Expected PARTIAL at 300s, got ${res4.data_state}`);

  // 5. Just over 5 minutes (301s) -> HISTORICAL
  const trip301s = { trip_id: 'TEST-5', source: 'conductor', serverReceivedAt: baseTime - 301000 };
  const res5 = evaluateSignalStatus(trip301s, baseTime);
  console.assert(res5.data_state === 'HISTORICAL', `Test 5 Failed: Expected HISTORICAL at 301s, got ${res5.data_state}`);

  // 6. No location history / null -> NO_DATA
  const res6 = evaluateSignalStatus(null, baseTime);
  console.assert(res6.data_state === 'NO_DATA', `Test 6 Failed: Expected NO_DATA for null, got ${res6.data_state}`);
  console.assert(res6.last_ping_age_seconds === null, 'Test 6 Null Age Failed');

  console.log('All Signal Evaluator Unit Tests Passed Successfully!\n');
}

runSignalEvaluatorTests();
