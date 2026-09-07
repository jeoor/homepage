<template>
  <!-- 功能区域 -->
  <div class="function" :class="{ mobile: store.mobileFuncState }">
    <el-row :gutter="20">
      <el-col :span="12">
        <div class="left">
          <Hitokoto />
          <Music v-if="song.id" :always-show="isMobile && !store.mobileFuncState" />
        </div>
      </el-col>
      <el-col :span="12">
        <div class="right" :class="{ cards: !isMobile }">
          <div class="time" :class="{ 'mobile-time': isMobile }">
            <div class="date">
              <span>{{ currentTime.year }}&nbsp;年&nbsp;</span>
              <span>{{ currentTime.month }}&nbsp;月&nbsp;</span>
              <span>{{ currentTime.day }}&nbsp;日&nbsp;</span>
              <span v-if="!isMobile" class="sm-hidden">{{ currentTime.weekday }}</span>
            </div>
            <div class="text">
              <span>{{ currentTime.hour }}:{{ currentTime.minute }}:{{ currentTime.second }}</span>
            </div>
          </div>
          <Weather v-if="!isMobile" />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { getCurrentTime } from "@/utils/getTime";
import { mainStore } from "@/store";
import Music from "@/components/Music.vue";
import Hitokoto from "@/components/Hitokoto.vue";
import Weather from "@/components/Weather.vue";
import { song } from "@/config";

const store = mainStore();

// 移动端状态
const isMobile = computed(() => (store.getInnerWidth ?? window.innerWidth) < 720);

// 当前时间
const currentTime = ref(getCurrentTime());
const timeInterval = ref(null);

// 更新时间
const updateTimeData = () => {
  currentTime.value = getCurrentTime();
};

onMounted(() => {
  timeInterval.value = setInterval(updateTimeData, 1000);
});

onBeforeUnmount(() => {
  clearInterval(timeInterval.value);
});
</script>

<style lang="scss" scoped>
.function {
  height: 165px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  &.mobile {
    .el-row {
      .el-col {
        &:nth-of-type(1) {
          display: contents;
        }
        &:nth-of-type(2) {
          display: none;
        }
      }
    }
  }
  .el-row {
    height: 100%;
    width: 100%;
    margin: 0 !important;
    .el-col {
      &:nth-of-type(1) {
        padding-left: 0 !important;
      }
      &:nth-of-type(2) {
        padding-right: 0 !important;
      }
      @media (max-width: 910px) {
        &:nth-of-type(1) {
          display: none;
        }
        &:nth-of-type(2) {
          padding: 0 !important;
          flex: none;
          max-width: none;
          width: 100%;
        }
      }
    }
    .left,
    .right {
      width: 100%;
      height: 100%;
    }
    .right {
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      animation: fade 0.5s;
      .time {
        font-size: 1.1rem;
        text-align: center;
        .date {
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }
        .text {
          margin-top: 10px;
          font-size: 3.25rem;
          letter-spacing: 2px;
          font-family: "UnidreamLED";
        }
        &.mobile-time {
          margin-bottom: 16px;
          .date {
            line-height: 1.2;
          }
          .text {
            margin-top: 4px;
            font-size: 2.5rem;
            line-height: 1;
            letter-spacing: 3px;
          }
        }
      }
      .weather {
        text-align: center;
        width: 100%;
        text-overflow: ellipsis;
        overflow-x: hidden;
        white-space: nowrap;
      }
    }
  }
}

@media (max-width: 719.98px) {
  .function:not(.mobile) {
    height: auto;
    .el-row {
      height: auto;
      flex-direction: column;
      .el-col {
        &:nth-of-type(1),
        &:nth-of-type(2) {
          display: contents;
        }
      }
      .left,
      .right {
        display: contents;
      }
      .left {
        :deep(.hitokoto) {
          display: none !important;
        }
        :deep(.music) {
          order: 2;
          height: 165px;
          animation: none;
        }
      }
      .right {
        animation: none;
        .time {
          order: 1;
          width: 100%;
        }
      }
    }
  }
}
</style>
