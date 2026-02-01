import { createClient } from 'redis';

async function testRedis() {
  console.log('🔄 Testing Redis Labs connection...\n');

  const client = createClient({
    username: 'default',
    password: 'UtdjL83AM5oGierD3LY0Yb4LbYg6oQPn',
    socket: {
      host: 'redis-16515.crce276.ap-south-1-3.ec2.cloud.redislabs.com',
      port: 16515,
      connectTimeout: 10000,
    },
  });

  client.on('error', (err) => console.error('❌ Redis Client Error:', err));
  client.on('connect', () => console.log('✅ Connected to Redis Labs'));

  try {
    await client.connect();
    
    // Test basic operations
    console.log('\n📝 Testing SET operation...');
    await client.set('test:foo', 'bar');
    console.log('✅ SET test:foo = bar');
    
    console.log('\n📖 Testing GET operation...');
    const result = await client.get('test:foo');
    console.log('✅ GET test:foo =', result);
    
    // Test with expiry
    console.log('\n⏰ Testing SETEX operation...');
    await client.setEx('test:temp', 60, 'temporary');
    const tempValue = await client.get('test:temp');
    console.log('✅ SETEX test:temp =', tempValue, '(expires in 60s)');
    
    // Test TTL
    const ttl = await client.ttl('test:temp');
    console.log('✅ TTL test:temp =', ttl, 'seconds');
    
    // Test DEL
    console.log('\n🗑️  Testing DEL operation...');
    await client.del('test:foo');
    const deleted = await client.get('test:foo');
    console.log('✅ DEL test:foo, value after delete:', deleted || 'null');
    
    // Test Hash operations
    console.log('\n📚 Testing HASH operations...');
    await client.hSet('test:hash', 'field1', 'value1');
    await client.hSet('test:hash', 'field2', 'value2');
    const hashValue = await client.hGet('test:hash', 'field1');
    console.log('✅ HSET/HGET test:hash =', hashValue);
    
    const allHash = await client.hGetAll('test:hash');
    console.log('✅ HGETALL test:hash =', allHash);
    
    // Cleanup
    await client.del('test:temp');
    await client.del('test:hash');
    
    console.log('\n🎉 All Redis operations successful!');
    console.log('✅ Redis Labs is ready for production use');
    
    await client.quit();
  } catch (error) {
    console.error('\n❌ Redis test failed:', error);
    process.exit(1);
  }
}

testRedis();
