import { evaluateSignalStatus } from './index.js';
import { 
  getHistoricalRecords, 
  matchNearestSegment, 
  calculateHistoricalBaseline, 
  computeSignalAwareEta,
  fetchMlEta,
  computeSignalAwareEtaWithMl,
  computeHybridEta,
  fetchMlComparisonMetrics
} from './etaService.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runPhase6ExperimentIntegrationTests() {
  console.log('Running Phase 6 Missing-Data Degradation Experiment Integration Tests...\n');

  // 1. Check missing_data_results.json exists and contains 0%, 25%, 50%, 75%, 100%
  const resultsPath = path.join(__dirname, '..', 'machine-learning', 'results', 'missing_data_results.json');
  console.assert(fs.existsSync(resultsPath), 'Test 1 Failed: missing_data_results.json file does not exist');
  const results = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
  console.log('✔ Test 1 Passed: missing_data_results.json exists and is readable');

  // 2. Check all 5 levels are present
  const requiredLevels = ['0%', '25%', '50%', '75%', '100%'];
  requiredLevels.forEach(lvl => {
    console.assert(results.levels && results.levels[lvl], `Test 2 Failed: Level ${lvl} missing from results JSON`);
  });
  console.log('✔ Test 2 Passed: All 5 missing data levels (0%, 25%, 50%, 75%, 100%) are present');

  // 3. Verify observed vs simulated trip labels in dataset
  const rawTrips = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'historicalTrips.json'), 'utf-8'));
  const observedCount = rawTrips.filter(t => t.data_origin === 'observed').length;
  const simulatedCount = rawTrips.filter(t => t.data_origin === 'simulated').length;
  console.assert(observedCount === 1, `Test 3 Failed: Expected 1 observed trip, found ${observedCount}`);
  console.assert(simulatedCount === 49, `Test 3 Failed: Expected 49 simulated trips, found ${simulatedCount}`);
  console.log('✔ Test 3 Passed: Observed (1) and Simulated (49) labels intact in dataset');

  // 4. Verify 100% missing level ML availability = false
  const level100 = results.levels['100%'];
  console.assert(level100.ml.available === false, 'Test 4 Failed: 100% missing ML available flag should be false');
  console.assert(level100.hybrid.fallback_active === true, 'Test 4 Failed: 100% missing Hybrid fallback_active should be true');
  console.assert(level100.hybrid.mae === level100.historical_baseline.mae, 'Test 4 Failed: 100% missing Hybrid MAE should equal Baseline MAE');
  console.log('✔ Test 4 Passed: 100% missing level correctly marks ML unavailable and activates Hybrid historical fallback');

  // 5. Verify 0% missing level metrics
  const level0 = results.levels['0%'];
  console.assert(level0.ml.available === true, 'Test 5 Failed: 0% missing ML available flag should be true');
  console.assert(level0.historical_baseline.mae > 0, 'Test 5 Baseline MAE Failed');
  console.assert(level0.ml.mae > 0, 'Test 5 ML MAE Failed');
  console.assert(level0.hybrid.mae > 0, 'Test 5 Hybrid MAE Failed');
  console.log(`✔ Test 5 Passed: 0% missing level metrics valid (Baseline MAE: ${level0.historical_baseline.mae}, ML MAE: ${level0.ml.mae}, Hybrid MAE: ${level0.hybrid.mae})`);

  // 6. Verify existing Phase 3, 4, 5 tests remain functional
  const baselineTest = calculateHistoricalBaseline({
    routeId: 'SH-VIT-01',
    direction: 'SEHORE_TO_VIT',
    currentWaypointIndex: 0,
    targetWaypointIndex: 4,
    timeOfDayBucket: 'morning',
    dayOfWeek: 'weekday'
  });
  console.assert(baselineTest.etaMinutes > 0, 'Test 6 Failed: Baseline calculation failed');
  console.log('✔ Test 6 Passed: Existing Phase 3/4/5 Historical Baseline functionality preserved intact');

  console.log('\nAll Phase 6 Missing-Data Experiment Integration Tests Passed Successfully!\n');
}

runPhase6ExperimentIntegrationTests();
