// 站点配置集中管理
// 说明：非敏感配置写死于此；高德 Web 服务 Key 走环境变量（平台上配置，构建时注入）

// ===== 站点信息 =====
export const siteName = "敖苛的主页";
export const siteAnthor = "敖苛";
export const siteKeywords = "敖苛,个人主页, 主页, Kayro, home, homepage";
export const siteDes = "存活在隐蔽的角落";
export const siteUrl = "kayro.cn";
export const siteLogo = "/logo.svg";
export const siteMainLogo = "/dog.webp";
export const siteAppleLogo = "/logo.png";

// ===== 简介文本 =====
export const descHello = "Hello World !";
export const descText = "一个简单的人的简单的网站，欢迎您的到来";
export const descHelloOther = "Oops !";
export const descTextOther = "哎呀，这都被你发现了（ 再点击一次可关闭 ）";

// ===== 建站日期 / 备案 =====
export const siteStart = "2026-02-13";
export const siteIcp = "冀ICP备2026002497号-1";
export const sitePublicSecurity = "冀公网安备13112502001042号";
export const siteMengIcp = "萌ICP备20261311号";

// ===== 音乐（歌曲 API，非敏感） =====
export const song = {
  api: "https://music.zhheo.com/meting-api/",
  server: "netease",
  type: "playlist",
  id: "12607574027",
};

// ===== 站点链接 =====
// 高德 Key 不走这里，由 Weather.vue 从 import.meta.env.VITE_WEATHER_KEY 读取（平台环境变量）
export const siteLinks = [
  { icon: "Blog", name: "博客", link: "https://blog.kayro.cn/" },
  { icon: "Bilibili", name: "B 站主页", link: "https://space.bilibili.com/513671572" },
  { icon: "CompactDisc", name: "音乐", link: "https://music.kayro.cn/" },
  { icon: "Images", name: "相册", link: "https://gallery.kayro.cn/" },
  { icon: "Compass", name: "有趣的东西", link: "https://fun.kayro.cn/" },
  { icon: "LaptopCode", name: "站点监测", link: "https://status.kayro.cn/" },
];

// ===== 社交链接 =====
export const socialLinks = [
  {
    name: "Github",
    icon: "Github",
    tip: "去 Github 看看",
    url: "https://github.com/jeoor",
  },
  {
    name: "BiliBili",
    icon: "Bilibili",
    tip: "(゜-゜)つロ 干杯 ~",
    url: "https://space.bilibili.com/513671572",
  },
  {
    name: "Email",
    icon: "Envelope",
    tip: "来封 Email ~",
    url: "mailto:i@kayro.cn",
  },
];
