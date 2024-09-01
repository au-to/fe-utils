import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

interface CacheEntry {
  data: any, // 缓存数据
  timestamp: number, // 设置缓存的时间戳
  ttl: number // 缓存有效期
}

// 默认的缓存有效期
const default_ttl = 5 * 60 * 1000;

// 基于请求参数生成唯一的缓存键
function generateCacheKey(config: AxiosRequestConfig): string {
  return `${config.method}-${config.url}-${JSON.stringify(config.params)}-${JSON.stringify(config.data)}`;
}

// 检查缓存的数据是否可用和有效
function getCache(key: string): any | null {
  const catcheEntry = localStorage.getItem(key);
  if (catcheEntry) {
    const parseEntry: CacheEntry = JSON.parse(catcheEntry);
    const isExpired = Date.now() - parseEntry.timestamp > parseEntry.ttl;
    if (!isExpired) {
      return parseEntry.data;
    } else {
      localStorage.removeItem(key);
    }
  } else {
    return null;
  }
}

// 设置缓存
function setCache(key: string, data: any, ttl: number = default_ttl): any {
  const catcheEntry: CacheEntry = {
    data,
    timestamp: Date.now(),
    ttl
  };
  localStorage.setItem(key, JSON.stringify(catcheEntry));
}

// 带缓存逻辑的请求函数
async function cachedRequest(config: AxiosRequestConfig, ttl?: number): Promise<AxiosResponse<any>> {
  const cacheKey = generateCacheKey(config);
  const cachedData = getCache(cacheKey);
  if (cachedData) {
    return cachedData;
  } else {
    const response = await axios(config);
    setCache(cacheKey, response.data, ttl);
    return response;
  }
}

export default cachedRequest;