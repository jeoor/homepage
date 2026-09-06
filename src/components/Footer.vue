<template>
  <footer id="footer" :class="store.footerBlur ? 'blur' : null">
    <Transition name="fade" mode="out-in">
      <div v-if="!store.playerState || !store.playerLrcShow" class="power">
        <span class="footer-item">
          {{ fullYear }}&nbsp;&copy;&nbsp;<a :href="siteUrl">{{ siteAnthor }}</a>
        </span>
        <!-- 以下信息请不要修改哦 -->
        <span class="footer-item hidden">
          &amp;&nbsp;Made&nbsp;by
          <a :href="config.github" target="_blank">
            {{ config.author }}
          </a>
        </span>
        <!-- 站点备案 -->
        <a v-if="siteIcp" class="footer-item" href="https://beian.miit.gov.cn" target="_blank">
          &amp;&nbsp;{{ siteIcp }}
        </a>
        <!-- 公网安备 -->
        <a v-if="sitePublicSecurity" class="footer-item" :href="publicSecurityUrl" target="_blank">
          &amp;&nbsp;{{ sitePublicSecurity }}
        </a>
        <!-- 萌ICP备 -->
        <a v-if="siteMengIcp" class="footer-item" :href="mengIcpUrl" target="_blank">
          &amp;&nbsp;{{ siteMengIcp }}
        </a>
      </div>
      <div v-else class="lrc">
        <Transition name="fade" mode="out-in">
          <div class="lrc-all" :key="store.getPlayerLrc">
            <music-one theme="filled" size="18" fill="#efefef" />
            <span class="lrc-text text-hidden" v-html="store.getPlayerLrc" />
            <music-one theme="filled" size="18" fill="#efefef" />
          </div>
        </Transition>
      </div>
    </Transition>
  </footer>
</template>

<script setup>
import { MusicOne } from "@icon-park/vue-next";
import { mainStore } from "@/store";
import config from "@/../package.json";
import { siteIcp, sitePublicSecurity, siteMengIcp, siteAnthor, siteUrl as siteUrlC } from "@/config";

const store = mainStore();
const fullYear = new Date().getFullYear();

// 站点链接
const siteUrl = computed(() => {
  const url = siteUrlC;
  if (!url) return "https://www.imsyy.top";
  // 判断协议前缀
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return "//" + url;
  }
  return url;
});

// 公网安备链接
const publicSecurityUrl = computed(() => {
  const code = sitePublicSecurity.value;
  if (!code) return "https://beian.mps.gov.cn";
  // 提取数字部分
  const match = code.match(/\d+/);
  const number = match ? match[0] : code;
  return `https://beian.mps.gov.cn/#/query/webSearch?code=${number}`;
});

// 萌ICP备链接
const mengIcpUrl = computed(() => {
  const keyword = siteMengIcp.value;
  if (!keyword) return "https://icp.gov.moe";
  // 提取数字部分
  const match = keyword.match(/\d+/);
  const number = match ? match[0] : keyword;
  return `https://icp.gov.moe/?keyword=${number}`;
});
</script>

<style lang="scss" scoped>
#footer {
  width: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 0;
  .power {
    animation: fade 0.3s;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 8px;
    padding: 8px;
    font-size: 14px;
    line-height: 1.4;
  }
  .footer-item {
    white-space: nowrap;
    display: inline-block;
  }
  .lrc {
    padding: 0 20px;
    height: 46px;
    line-height: 46px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    .lrc-all {
      width: 98%;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      .lrc-text {
        margin: 0 8px;
      }
      .i-icon {
        width: 18px;
        height: 18px;
        display: inherit;
      }
    }
  }
  &.blur {
    backdrop-filter: blur(10px);
    background: rgb(0 0 0 / 25%);
    .power {
      font-size: 16px;
    }
  }
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.15s ease-in-out;
  }
  @media (max-width: 768px) {
    .power {
      font-size: 12px;
      gap: 6px;
      padding: 6px;
    }
  }
  @media (max-width: 480px) {
    .power {
      font-size: 10px;
      gap: 3px;
      padding: 3px 4px;
      line-height: 1.3;
    }
    .footer-item {
      white-space: normal;
      word-break: break-word;
    }
    .hidden {
      display: none;
    }
  }
}
</style>
