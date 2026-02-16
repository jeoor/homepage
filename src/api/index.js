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
  try {
    console.log("Open-Meteo - 开始获取天气数据...");

    // 先获取用户IP和位置
    const geoRes = await fetch("https://ipapi.co/json/", {
      credentials: "omit",
    });

    if (!geoRes.ok) {
      throw new Error(`地理位置 API 返回错误: ${geoRes.status}`);
    }

    const geoData = await geoRes.json();
    console.log("地理位置数据:", geoData);

    let { latitude, longitude, city } = geoData;

    // 确保坐标是数字类型
    latitude = parseFloat(latitude);
    longitude = parseFloat(longitude);

    console.log(`解析后的坐标 - 纬度: ${latitude}, 经度: ${longitude}, 城市: ${city}`);

    if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
      throw new Error(`无法获取有效的地理坐标, latitude: ${latitude}, longitude: ${longitude}`);
    }

    // 获取天气数据
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_direction_10m,wind_speed_10m&timezone=auto`;
    console.log("请求URL:", weatherUrl);

    const weatherRes = await fetch(weatherUrl, {
      credentials: "omit",
    });

    if (!weatherRes.ok) {
      throw new Error(`天气 API 返回错误: ${weatherRes.status}`);
    }

    const weatherData = await weatherRes.json();
    console.log("天气数据:", weatherData);

    if (!weatherData.current) {
      throw new Error("天气数据中缺少 current 字段");
    }

    const current = weatherData.current;

    // 天气代码转换为中文
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

    return {
      result: {
        city: {
          City: city || "未知地区",
        },
        condition: {
          day_weather: weatherCodeMap[current.weather_code] || "未知",
          min_degree: current.temperature_2m,
          max_degree: current.temperature_2m,
          day_wind_direction: current.wind_direction_10m || 0,
          day_wind_power: Math.round(current.wind_speed_10m / 5) || 0, // 风速转风级
        },
      },
    };
  } catch (error) {
    console.error("Open-Meteo API 调用失败:", error);
    throw error;
  }
};
