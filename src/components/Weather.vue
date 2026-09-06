<template>
  <div class="weather" v-if="weatherData.adCode.city && weatherData.weather.weather">
    <span>{{ weatherData.adCode.city }}&nbsp;</span>
    <span>{{ weatherData.weather.weather }}&nbsp;</span>
    <span>{{ weatherData.weather.temperature }}℃</span>
    <span class="sm-hidden">
      &nbsp;{{
        weatherData.weather.winddirection?.endsWith("风")
          ? weatherData.weather.winddirection
          : weatherData.weather.winddirection + "风"
      }}&nbsp;
    </span>
    <span class="sm-hidden">{{ weatherData.weather.windpower }}&nbsp;级</span>
  </div>
  <div class="weather" v-else>
    <span>天气数据获取失败</span>
  </div>
</template>

<script setup>
import { getAdcode, getWeather } from "@/api";
import { Error } from "@icon-park/vue-next";

// 高德开发者 Key
const mainKey = import.meta.env.VITE_WEATHER_KEY;

// 天气数据
const weatherData = reactive({
  adCode: {
    city: null, // 城市
    adcode: null, // 城市编码
  },
  weather: {
    weather: null, // 天气现象
    temperature: null, // 实时气温
    winddirection: null, // 风向描述
    windpower: null, // 风力级别
  },
});

// 获取天气数据
const getWeatherData = async () => {
  try {
    if (mainKey) {
      try {
        console.log("桌面端 - 尝试获取高德天气数据...");
        // 获取 Adcode
        const adCode = await getAdcode(mainKey);
        console.log("高德 Adcode 响应:", adCode);

        if (!adCode.infocode || adCode.infocode !== "10000") {
          throw new Error("高德地区查询失败，降级使用备用API");
        }

        weatherData.adCode = {
          city: adCode.city,
          adcode: adCode.adcode,
        };

        // 获取天气信息
        const result = await getWeather(mainKey, weatherData.adCode.adcode);
        console.log("高德天气响应:", result);

        if (!result.lives || !result.lives[0]) {
          throw new Error("高德天气数据无效，降级使用备用API");
        }

        weatherData.weather = {
          weather: result.lives[0].weather,
          temperature: result.lives[0].temperature,
          winddirection: result.lives[0].winddirection,
          windpower: result.lives[0].windpower,
        };
        return; // 成功，直接返回
      } catch (error) {
        console.warn("高德天气 API 失败:", error);
      }
    }

  } catch (error) {
    console.error("天气信息获取失败:", error);
    onError("天气数据获取失败");
  }
};

// 报错信息
const onError = (message) => {
  ElMessage({
    message,
    icon: h(Error, {
      theme: "filled",
      fill: "#efefef",
    }),
  });
  console.error(message);
};

onMounted(() => {
  // 调用获取天气
  getWeatherData();
});
</script>
