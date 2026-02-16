// import axios from "axios";
import fetchJsonp from "fetch-jsonp";

/**
 * 音乐播放器
 */

// 获取音乐播放列表
export const getPlayerList = async (server, type, id) => {
  const res = await fetch(
    `${import.meta.env.VITE_SONG_API}?server=${server}&type=${type}&id=${id}`,
  );
  const data = await res.json();

  if (data[0].url.startsWith("@")) {
    // eslint-disable-next-line no-unused-vars
    const [handle, jsonpCallback, jsonpCallbackFunction, url] = data[0].url.split("@").slice(1);
    const jsonpData = await fetchJsonp(url).then((res) => res.json());
    const domain = (
      jsonpData.req_0.data.sip.find((i) => !i.startsWith("http://ws")) ||
      jsonpData.req_0.data.sip[0]
    ).replace("http://", "https://");

    return data.map((v, i) => ({
      name: v.name || v.title,
      artist: v.artist || v.author,
      url: domain + jsonpData.req_0.data.midurlinfo[i].purl,
      cover: v.cover || v.pic,
      lrc: v.lrc,
    }));
  } else {
    return data.map((v) => ({
      name: v.name || v.title,
      artist: v.artist || v.author,
      url: v.url,
      cover: v.cover || v.pic,
      lrc: v.lrc,
    }));
  }
};

/**
 * 一言
 */

// 获取一言数据
export const getHitokoto = async () => {
  const res = await fetch("https://v1.hitokoto.cn");
  return await res.json();
};

/**
 * 天气
 */

// 获取高德地理位置信息
export const getAdcode = async (key) => {
  const res = await fetch(`https://restapi.amap.com/v3/ip?key=${key}`, {
    credentials: "omit",
  });
  return await res.json();
};

// 获取高德地理天气信息
export const getWeather = async (key, city) => {
  const res = await fetch(
    `https://restapi.amap.com/v3/weather/weatherInfo?key=${key}&city=${city}`,
    {
      credentials: "omit",
    }
  );
  return await res.json();
};

// 获取 Open-Meteo 天气 API（无需密钥，支持CORS）
// https://open-meteo.com/
export const getOtherWeather = async () => {
  const CACHE_KEY = "weather_cache_v1";
  const CACHE_TTL = 1000 * 60 * 30;

  const readCache = () => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const cache = JSON.parse(raw);
      if (!cache?.timestamp || !cache?.data) return null;
      if (Date.now() - cache.timestamp > CACHE_TTL) return null;
      return cache.data;
    } catch (error) {
      console.warn("读取天气缓存失败:", error);
      return null;
    }
  };

  const writeCache = (data) => {
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          timestamp: Date.now(),
          data,
        }),
      );
    } catch (error) {
      console.warn("写入天气缓存失败:", error);
    }
  };

  const fetchJsonWithTimeout = async (url, timeout = 5000) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, {
        credentials: "omit",
        signal: controller.signal,
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      return null;
    } finally {
      clearTimeout(timer);
    }
  };

  const toWeatherResult = (city, current) => {
    const weatherCodeMap = {
      0: "晴朗",
      1: "晴朗",
      2: "部分多云",
      3: "多云",
      45: "雾",
      48: "结冰雾",
      51: "毛毛雨",
      53: "毛毛雨",
      55: "毛毛雨",
      61: "小雨",
      63: "中雨",
      65: "大雨",
      71: "小雪",
      73: "中雪",
      75: "大雪",
      77: "雪粒",
      80: "阵雨",
      81: "阵雨",
      82: "暴雨",
      85: "阵雪",
      86: "阵雪",
      95: "雷暴",
      96: "冰雹雷暴",
      99: "冰雹雷暴",
    };

    const getWindDirection = (degrees) => {
      const directions = [
        "北", "北东北", "东北", "东东北",
        "东", "东东南", "东南", "南东南",
        "南", "南西南", "西南", "西西南",
        "西", "西西北", "西北", "北西北",
      ];
      const index = Math.round((degrees % 360) / 22.5) % 16;
      return directions[index] + "风";
    };

    const getWindPower = (speed) => {
      if (speed < 1) return "0";
      if (speed < 2) return "1";
      if (speed < 3) return "2";
      if (speed < 5) return "3";
      if (speed < 8) return "4";
      if (speed < 11) return "5";
      if (speed < 14) return "6";
      if (speed < 17) return "7";
      if (speed < 21) return "8";
      if (speed < 24) return "9";
      if (speed < 28) return "10";
      if (speed < 33) return "11";
      return "12";
    };

    return {
      result: {
        city: {
          City: city || "未知地区",
        },
        condition: {
          day_weather: weatherCodeMap[current.weather_code] || "未知",
          min_degree: current.temperature_2m,
          max_degree: current.temperature_2m,
          day_wind_direction: getWindDirection(current.wind_direction_10m || 0),
          day_wind_power: getWindPower(current.wind_speed_10m || 0),
        },
      },
    };
  };

  try {
    console.log("Open-Meteo - 开始获取天气数据...");

    const [ipWhoData, ipapiCoData] = await Promise.all([
      fetchJsonWithTimeout("https://ipwho.is/", 4000),
      fetchJsonWithTimeout("https://ipapi.co/json/", 4000),
    ]);

    let latitude = null;
    let longitude = null;
    let city = null;

    if (ipWhoData?.success !== false && ipWhoData?.latitude && ipWhoData?.longitude) {
      latitude = parseFloat(ipWhoData.latitude);
      longitude = parseFloat(ipWhoData.longitude);
      city = ipWhoData.city;
      console.log("使用 ipwho.is 定位:", { latitude, longitude, city });
    } else if (ipapiCoData?.latitude && ipapiCoData?.longitude) {
      latitude = parseFloat(ipapiCoData.latitude);
      longitude = parseFloat(ipapiCoData.longitude);
      city = ipapiCoData.city;
      console.log("使用 ipapi.co 定位:", { latitude, longitude, city });
    }

    console.log(`最终坐标 - 纬度: ${latitude}, 经度: ${longitude}, 城市: ${city}`);

    if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
      throw new Error(`无法获取有效的地理坐标, latitude: ${latitude}, longitude: ${longitude}`);
    }

    // 获取天气数据
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_direction_10m,wind_speed_10m&timezone=auto`;
    console.log("请求天气URL:", weatherUrl);

    let weatherData = null;
    for (let i = 0; i < 2; i++) {
      weatherData = await fetchJsonWithTimeout(weatherUrl, 5000);
      if (weatherData?.current) break;
      console.warn(`天气请求第 ${i + 1} 次失败，准备重试...`);
    }

    if (!weatherData?.current) {
      throw new Error("天气 API 请求失败或返回数据不完整");
    }

    console.log("天气数据:", weatherData);

    const current = weatherData.current;

    const result = toWeatherResult(city, current);
    writeCache(result);
    return result;
  } catch (error) {
    console.error("Open-Meteo API 调用失败:", error);

    const cached = readCache();
    if (cached) {
      console.warn("使用天气缓存数据作为兜底");
      return cached;
    }

    throw error;
  }
};
