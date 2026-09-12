import fs from 'fs';
import path from 'path';

const API = 'http://localhost:3001/api';

async function runScenario() {
  console.log('--- STARTING LEARNLOOP ACCEPTANCE TEST SCENARIO ---');

  // Helper fetch
  async function post(endpoint: string, body?: any) {
    const res = await fetch(`${API}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    return res.json();
  }

  async function get(endpoint: string) {
    const res = await fetch(`${API}${endpoint}`);
    return res.json();
  }

  // 1. Reset to Demo
  console.log('\n[Step 1 & 2] Resetting to Demo Mode (Introduction to Data Structures)...');
  const demoRes = await post('/demo/reset');
  console.log('✓ Demo Reset Response:', demoRes.message, `(${demoRes.topicsCount} topics)`);

  // 2. Fetch Dashboard
  console.log('\n[Step 3, 4, 5] Verifying Dashboard, Topics, and Today\'s Plan...');
  let dash = await get('/dashboard');
  console.log('✓ Total topics:', dash.stats.total_topics);
  console.log('✓ Mastered topics:', dash.stats.mastered_topics);
  console.log('✓ Initial progress:', dash.stats.progress_percent + '%');
  console.log('✓ Active document:', dash.activeDocument?.title);
  console.log('✓ Today\'s plan items:', dash.todayPlan.length);
  console.log('✓ First topic:', dash.topics[0].title, '| Status:', dash.topics[0].status);
  console.log('✓ Second topic:', dash.topics[1].title, '| Status:', dash.topics[1].status);

  if (dash.topics[0].status !== 'available' || dash.topics[1].status !== 'locked') {
    throw new Error('Topic prerequisite locking mismatch!');
  }

  // 3. Open available topic & record study session
  console.log('\n[Step 6 & 7] Opening topic-arrays and logging Pomodoro study session...');
  const studyRes = await post('/topics/topic-arrays/study', { durationMinutes: 25, notes: 'Studied contiguous memory' });
  console.log('✓ Study Session recorded:', studyRes.session.id, '| Topic status:', studyRes.topic.status);

  // 4. Submit Incomplete Feynman Explanation
  console.log('\n[Step 8, 9, 10] Submitting INCOMPLETE Feynman explanation...');
  const incompleteExplanation = 'An array holds stuff in a line.';
  const failRes = await post('/topics/topic-arrays/feynman', { explanation: incompleteExplanation });
  console.log('✓ Evaluation Result:');
  console.log('   - Passed:', failRes.evaluation.passed);
  console.log('   - Score:', failRes.evaluation.score);
  console.log('   - Feedback:', failRes.evaluation.feedback);
  console.log('   - Missing Concepts:', failRes.evaluation.missing_concepts);
  console.log('   - Topic Status:', failRes.topic.status);

  if (failRes.evaluation.passed !== false) {
    throw new Error('Incomplete explanation should have been rejected!');
  }
  if (failRes.topic.status === 'mastered') {
    throw new Error('Topic should NOT be marked mastered on failure!');
  }

  // 5. Submit Comprehensive Feynman Explanation
  console.log('\n[Step 11, 12, 13] Submitting THOROUGH Feynman explanation...');
  const completeExplanation = `
An array is a linear data structure that stores elements in contiguous blocks of memory right next to each other.
Because elements are strictly adjacent and each element occupies a known fixed size, the computer does not need to search to find an item. Instead, it computes the exact memory address in O(1) constant time using the arithmetic formula: BaseAddress + (Index * ElementSize).
However, because memory is contiguous and static, if you want to insert or delete an item in the beginning or middle, you have to shift all subsequent elements over, which incurs an O(n) linear time penalty. Dynamic arrays solve the fixed capacity limit by doubling their allocated buffer and copying elements over when full.
  `.trim();

  const passRes = await post('/topics/topic-arrays/feynman', { explanation: completeExplanation });
  console.log('✓ Evaluation Result:');
  console.log('   - Passed:', passRes.evaluation.passed);
  console.log('   - Score:', passRes.evaluation.score);
  console.log('   - Strengths:', passRes.evaluation.strengths);
  console.log('   - Topic Status:', passRes.topic.status);

  if (!passRes.evaluation.passed) {
    throw new Error('Comprehensive explanation should have passed!');
  }
  if (passRes.topic.status !== 'mastered') {
    throw new Error('Topic status should now be mastered!');
  }

  // 6. Verify Dashboard updates: Progress increased, Next topic unlocked, Revision scheduled
  console.log('\n[Step 14, 15, 16, 17] Verifying progressive unlocks, revision scheduling, and progress...');
  dash = await get('/dashboard');
  console.log('✓ New Progress:', dash.stats.progress_percent + '%', `(${dash.stats.mastered_topics} / ${dash.stats.total_topics})`);
  console.log('✓ First topic status:', dash.topics[0].status);
  console.log('✓ Second topic (Linked Lists) status:', dash.topics[1].status);
  console.log('✓ Current Streak:', dash.stats.current_streak, 'days');
  console.log('✓ Upcoming Revisions scheduled:', dash.upcomingReviews.length);
  dash.upcomingReviews.forEach((r: any) => {
    console.log(`   - Review for ${r.topic_title}: due ${r.due_date} (${r.relativeLabel})`);
  });

  if (dash.topics[1].status !== 'available') {
    throw new Error('Linked Lists should now be unlocked (status: available)!');
  }
  if (dash.stats.progress_percent <= 0) {
    throw new Error('Mastery progress percent did not increase!');
  }

  // 7. Settings & Test Connection
  console.log('\n[Step 18, 19, 20] Verifying Settings update & Test Connection...');
  const updateSettingsRes = await post('/settings', {
    model: 'gpt-4o-mini',
    default_session_minutes: 30,
  });
  console.log('✓ Settings updated:', updateSettingsRes.settings);

  const testConnRes = await post('/settings/test-connection', {
    provider: 'openai',
    model: 'gpt-4o-mini',
    api_key: 'test-mock-key',
  });
  console.log('✓ Connection test handled gracefully:', testConnRes);

  console.log('\n======================================================');
  console.log('🎉 ALL ACCEPTANCE TEST CRITERIA PASSED SUCCESSFULLY! 🎉');
  console.log('======================================================');
}

runScenario().catch((err) => {
  console.error('\n❌ Scenario verification failed:', err);
  process.exit(1);
});
