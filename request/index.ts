import axios, { AxiosRequestConfig, AxiosResponse, AxiosRequestHeaders } from "axios";
interface CacheEntry {
  data: any, // 缓存数据
  timestamp: number, // 设置缓存的时间戳
  ttl: number // 缓存有效期
}

// 自定义配置对象
interface CacheConfig {
  storage?: 'localStorage' | 'sessionStorage', // 存储方式
  ttl?: number // 缓存有效期,
  clearOnError?: boolean, // 是否在请求失败时清除缓存
  cacheKeyGenerator?: (config: AxiosRequestConfig) => string // 自定义缓存键生成函数
}

// 默认的缓存有效期
const default_ttl = 5 * 60 * 1000;

// 基于请求参数生成唯一的缓存键
function defaultCacheKeyGenerator(config: AxiosRequestConfig): string {
  return `${config.method}-${config.url}-${JSON.stringify(config.params)}-${JSON.stringify(config.data)}`;
}

// 检查缓存的数据是否可用和有效
function getCache(key: string, storage: 'localStorage' | 'sessionStorage'): any | null {
  const catcheEntry = window[storage].getItem(key);
  if (catcheEntry) {
    const parseEntry: CacheEntry = JSON.parse(catcheEntry);
    const isExpired = Date.now() - parseEntry.timestamp > parseEntry.ttl;
    if (!isExpired) {
      return parseEntry.data;
    } else {
      window[storage].removeItem(key);
    }
  } else {
    return null;
  }
}

// 设置缓存
function setCache(key: string, data: any, storage: 'localStorage' | 'sessionStorage', ttl: number): any {
  const catcheEntry: CacheEntry = {
    data,
    timestamp: Date.now(),
    ttl
  };
  window[storage].setItem(key, JSON.stringify(catcheEntry));
}

// 带缓存逻辑的请求函数
async function cachedRequest(config: AxiosRequestConfig, cacheConfig: CacheConfig = {}): Promise<AxiosResponse<any>> {
  const {
    storage = 'localStorage',
    ttl = default_ttl,
    clearOnError = false,
    cacheKeyGenerator = defaultCacheKeyGenerator
  } = cacheConfig;

  const cacheKey = cacheKeyGenerator(config);
  const cachedData = getCache(cacheKey, storage);
  if (cachedData) {
    const mockHeaders: AxiosRequestHeaders = config.headers as AxiosRequestHeaders || {};
    const mockResponse: AxiosResponse = {
      data: cachedData,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { ...config, headers: mockHeaders },
      request: {}
    };
    return Promise.resolve(mockResponse);
  }

  try {
    const response = await axios(config);
    setCache(cacheKey, response.data, storage, ttl);
    return response;
  } catch (error) {
    if (clearOnError) {
      window[storage].removeItem(cacheKey);
    }
    return Promise.reject(error);
  }
}

export default cachedRequest;