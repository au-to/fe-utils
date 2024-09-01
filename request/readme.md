## 带有接口缓存的公共请求方法


### 设计思路
* 缓存存储：使用 localStorage 或 sessionStorage 作为缓存存储，基于请求的 URL 和参数生成唯一的缓存键。
* 缓存时效：每个缓存项存储时，同时保存生成时间和有效期（TTL）。
* 缓存获取：发起请求时，首先检查缓存是否存在且有效，如果有效则返回缓存数据，否则发起真实请求。
* 缓存更新：当真实请求返回响应时，更新缓存中的数据和时间戳。

### 优化
* 引入一个配置对象，允许开发者在调用缓存请求方法时自定义缓存的存储方式、TTL、缓存清理策略。

### exampla
```js
import cachedRequest from 'fe-utils/resquest/index.ts';
const config: AxiosRequestConfig = {
  url: '/api/data',
  method: 'get',
  params: { id: 123 }
};

const cacheConfig: CacheConfig = {
  storage: 'sessionStorage', // Use sessionStorage instead of localStorage
  ttl: 1000 * 60 * 10, // 10 minutes TTL
  clearOnError: true, // Clear cache on error
  cacheKeyGenerator: (config) => `custom-key-${config.url}` // Custom cache key generator
};

cachedRequest(config, cacheConfig)
  .then(response => {
    console.log('Data:', response.data);
  })
  .catch(error => {
    console.error('Request failed:', error);
  });
  ```