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
  const GEO_CACHE_KEY = "weather_geo_cache_v1";
  const GEO_CACHE_TTL = 1000 * 60 * 60 * 24;

  const readGeoCache = () => {
    try {
      const raw = localStorage.getItem(GEO_CACHE_KEY);
      if (!raw) return null;
      const cache = JSON.parse(raw);
      if (!cache?.timestamp) return null;
      if (Date.now() - cache.timestamp > GEO_CACHE_TTL) return null;
      if (!cache?.latitude || !cache?.longitude) return null;
      return cache;
    } catch {
      return null;
    }
  };

  const writeGeoCache = (latitude, longitude, city) => {
    try {
      localStorage.setItem(
        GEO_CACHE_KEY,
        JSON.stringify({
          timestamp: Date.now(),
          latitude,
          longitude,
          city,
        }),
      );
    } catch {
      // ignore
    }
  };

  const getJson = async (url, timeout = 3500) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetch(url, {
        credentials: "omit",
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`请求失败: ${url}`);
      return await res.json();
    } finally {
      clearTimeout(timer);
    }
  };

  const firstFulfilled = (promises) =>
    new Promise((resolve, reject) => {
      let pending = promises.length;
      const errors = [];
      if (pending === 0) {
        reject(new Error("no promises"));
        return;
      }

      promises.forEach((p, index) => {
        Promise.resolve(p).then(resolve, (err) => {
          errors[index] = err;
          pending -= 1;
          if (pending === 0) {
            reject(errors[0] || new Error("all promises rejected"));
          }
        });
      });
    });

  const getGeoFromIpinfo = async () => {
    const data = await getJson("https://ipinfo.io/json", 2000);
    if (!data?.loc) throw new Error("ipinfo: no loc");
    const [lat, lng] = String(data.loc).split(",");
    const latitude = Number(lat);
    const longitude = Number(lng);
    if (!latitude || !longitude || Number.isNaN(latitude) || Number.isNaN(longitude)) {
      throw new Error("ipinfo: invalid coords");
    }
    return { latitude, longitude, city: data.city || null };
  };

  const getGeoFromIpwho = async () => {
    const data = await getJson("https://ipwho.is/", 3500);
    if (data?.success === false) throw new Error("ipwho: success=false");
    const latitude = Number(data?.latitude);
    const longitude = Number(data?.longitude);
    if (!latitude || !longitude || Number.isNaN(latitude) || Number.isNaN(longitude)) {
      throw new Error("ipwho: invalid coords");
    }
    return { latitude, longitude, city: data.city || null };
  };

  const getGeoFromIpapi = async () => {
    const data = await getJson("https://ipapi.co/json/", 3500);
    const latitude = Number(data?.latitude);
    const longitude = Number(data?.longitude);
    if (!latitude || !longitude || Number.isNaN(latitude) || Number.isNaN(longitude)) {
      throw new Error("ipapi: invalid coords");
    }
    return { latitude, longitude, city: data.city || null };
  };

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

  let latitude = null;
  let longitude = null;
  let city = null;

  try {
    const geo = await firstFulfilled([
      getGeoFromIpinfo(),
      getGeoFromIpwho(),
      getGeoFromIpapi(),
    ]);
    latitude = geo.latitude;
    longitude = geo.longitude;
    city = geo.city;
    writeGeoCache(latitude, longitude, city);
  } catch (error) {
    const cached = readGeoCache();
    if (cached) {
      latitude = Number(cached.latitude);
      longitude = Number(cached.longitude);
      city = cached.city || city;
    } else {
      throw new Error("无法获取有效的地理坐标");
    }
  }

  if (!city || /[A-Za-z]/.test(city)) {
    try {
      if (city && /[A-Za-z]/.test(city)) {
        const searchGeo = await getJson(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=zh&format=json&countryCode=CN`,
        );
        city = searchGeo?.results?.[0]?.name || city;
      }
    } catch (error) {
      city = city || "未知地区";
    }
  }

  const weatherData = await getJson(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_direction_10m,wind_speed_10m&timezone=Asia%2FShanghai`,
  );

  if (!weatherData?.current) {
    throw new Error("天气 API 返回数据不完整");
  }

  const current = weatherData.current;

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
