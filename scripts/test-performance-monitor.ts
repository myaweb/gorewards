/**
 * Test Performance Monitor Service
 */

import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(__dirname, '../.env') })

import { performanceMonitor } from '../lib/services/performanceMonitor'

async function testPerformanceMonitor() {
  console.log('📊 Testing Performance Monitor Service...')
  
  try {
    // Test 1: Response time recording
    console.log('\n1️⃣ Testing response time recording...')
    performanceMonitor.recordResponseTime('/api/test', 150, 'corr-1')
    performanceMonitor.recordResponseTime('/api/test', 2500, 'corr-2') // Slow
    console.log('   Response times recorded: ✅')

    // Test 2: Database query recording
    console.log('\n2️⃣ Testing database query recording...')
    performanceMonitor.recordDatabaseQuery('SELECT * FROM users', 50, 'corr-3')
    performanceMonitor.recordDatabaseQuery('SELECT * FROM cards', 600, 'corr-4') // Slow
    console.log('   Database queries recorded: ✅')

    // Test 3: Memory usage recording
    console.log('\n3️⃣ Testing memory usage recording...')
    const memUsage = performanceMonitor.getCurrentMemoryUsage()
    performanceMonitor.recordMemoryUsage(memUsage, 'corr-5')
    console.log(`   Memory usage: ${memUsage.percentage.toFixed(2)}% ✅`)

    // Test 4: Performance alerts
    console.log('\n4️⃣ Testing performance alerts...')
    const alerts = await performanceMonitor.checkPerformanceThresholds()
    console.log(`   Alerts generated: ${alerts.length} ✅`)
    if (alerts.length > 0) {
      console.log(`   Alert types: ${alerts.map(a => a.type).join(', ')}`)
    }

    // Test 5: System health
    console.log('\n5️⃣ Testing system health...')
    const health = await performanceMonitor.getSystemHealth()
    console.log(`   Status: ${health.status} ✅`)
    console.log(`   Uptime: ${(health.uptime / 1000).toFixed(2)}s`)
    console.log(`   Issues: ${health.issues.length}`)

    // Test 6: Performance metrics
    console.log('\n6️⃣ Testing performance metrics...')
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 3600000)
    const metrics = await performanceMonitor.getPerformanceMetrics({
      start: oneHourAgo,
      end: now
    })
    console.log(`   Avg response time: ${metrics.averageResponseTime.toFixed(2)}ms ✅`)
    console.log(`   Throughput: ${metrics.throughput.toFixed(2)} req/s`)
    console.log(`   Slow queries: ${metrics.databasePerformance.slowQueries}`)

    // Test 7: Configuration
    console.log('\n7️⃣ Testing configuration...')
    const config = performanceMonitor.getConfig()
    console.log(`   Metrics count: ${config.currentMetricsCount} ✅`)
    console.log(`   Response time threshold: ${config.thresholds.responseTime}ms`)

    console.log('\n🎉 All performance monitor tests passed!')
    return true
  } catch (error) {
    console.error('\n💥 Performance monitor test failed:', error)
    return false
  }
}

if (require.main === module) {
  testPerformanceMonitor().then((success) => {
    process.exit(success ? 0 : 1)
  })
}

export { testPerformanceMonitor }
