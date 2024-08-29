import axios, { AxiosRequestConfig } from "axios";

interface CacheEntry {
  data: any,
  timestamp: number,
  ttl: number
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