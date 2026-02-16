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

// 获取心知天气 API
// https://www.seniverse.com/
export const getOtherWeather = async () => {
  const key = import.meta.env.VITE_SENIVERSE_KEY;
  try {
    // 先获取 IP 地址定位
    const ipRes = await fetch("https://api.seniverse.com/v1/ip", {
      headers: {
        "X-Api-Key": key,
      },
      credentials: "omit",
    });
    const ipData = await ipRes.json();
    const location = ipData.results[0].id; // 获取当地位置 ID

    // 再获取天气数据
    const weatherRes = await fetch(
      `https://api.seniverse.com/v1/current.json?location=${location}&ts=0`,
      {
        headers: {
          "X-Api-Key": key,
        },
        credentials: "omit",
      }
    );
    const weatherData = await weatherRes.json();
    const result = weatherData.results[0];

    return {
      result: {
        city: {
          City: result.location.name,
        },
        condition: {
          day_weather: result.last_update.text,
          min_degree: result.last_update.temperature,
          max_degree: result.last_update.temperature,
          day_wind_direction: result.last_update.wind_direction,
          day_wind_power: result.last_update.windpower,
        },
      },
    };
  } catch (error) {
    console.error("心知天气 API 调用失败:", error);
    throw error;
  }
};
