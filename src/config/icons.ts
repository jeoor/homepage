// 链接图标注册表（FontAwesome 代码图标，非图片素材）
// 常规平台已内置，config.ts 里直接填 icon 名称即可；新增生僻图标时在此加一行映射
import {
  faLink,
  faBlog,
  faTv,
  faCompactDisc,
  faImages,
  faCompass,
  faLaptopCode,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import {
  faGithub,
  faBilibili,
  faTelegram,
  faWeixin,
  faQq,
  faZhihu,
  faXTwitter,
  faYoutube,
  faInstagram,
  faReddit,
  faDiscord,
} from "@fortawesome/free-brands-svg-icons";

const siteIcon = {
  // 网站
  Blog: faBlog,
  Tv: faTv,
  CompactDisc: faCompactDisc,
  Images: faImages,
  Compass: faCompass,
  LaptopCode: faLaptopCode,
  Envelope: faEnvelope,
  // 平台
  Github: faGithub,
  Bilibili: faBilibili,
  Telegram: faTelegram,
  Wechat: faWeixin,
  Weixin: faWeixin,
  Qq: faQq,
  Zhihu: faZhihu,
  X: faXTwitter,
  Youtube: faYoutube,
  Instagram: faInstagram,
  Reddit: faReddit,
  Discord: faDiscord,
};

// 按名称查找图标，未登记时返回默认图标
export const getSiteIcon = (name, fallback = faLink) => siteIcon[name] || fallback;
