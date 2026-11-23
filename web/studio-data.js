/**
 * Lulu Interactive Studio — 100% Verbatim Canonical Data Store
 * Zero AI-invented copy. Every headline, creator metric, dollar cost, quote,
 * working principle, side project, and bio line comes strictly from Lulu's original portfolio.
 */

export const STUDIO_META = {
  ownerCn: '卢倩莹',
  ownerEn: 'Lulu',
  brandMark: 'LU STUDIO',
  brandSub: '卢倩莹 · 个人档案',
  tagline: '营销 × 运营 × 记者',
  taglineEn: 'marketing × operations × journalism',
  eyebrow: 'creator partnerships · content · operations',
  location: 'Shanghai · Guangzhou · anywhere online',
  email: 'louiselu671@gmail.com',
  mailto: 'mailto:louiselu671@gmail.com',
  copyright: '© 2026 Lulu / 卢倩莹'
};

export const EDITIONS = [
  {
    id: 'a',
    short: 'A',
    name: '物化器物 Felix',
    en: 'Diegetic Objects'
  },
  {
    id: 'b',
    short: 'B',
    name: '复古系统 Poolsuite',
    en: 'Classic Mac OS'
  },
  {
    id: 'c',
    short: 'C',
    name: '瑞士印相页 Cosmos',
    en: 'Swiss Contact Sheet'
  }
];

export const STATIONS = [
  {
    id: 'notebook',
    num: '01',
    navLabel: 'ABOUT',
    cnLabel: '笔记本',
    sectionTitle: 'About / 自我介绍',
    hint: '翻开中央笔记本，阅读自我介绍与履历'
  },
  {
    id: 'tv',
    num: '02',
    navLabel: 'MARKETING',
    cnLabel: '电视机',
    sectionTitle: '01 / Overseas creator marketing',
    hint: '切换 Seedance 2.5 · Kimi K3 · MiniMax M3.1，直接播放全部合作样片'
  },
  {
    id: 'newspaper',
    num: '03',
    navLabel: 'JOURNALISM',
    cnLabel: '报纸',
    sectionTitle: '02 / Journalism archive',
    hint: '一页通览《连线 Insight》《时代周报》《北京青年报》全部 10 篇报道'
  },
  {
    id: 'shelf',
    num: '04',
    navLabel: 'SHELF',
    cnLabel: '书架',
    sectionTitle: '03 / Shelf',
    hint: '浏览两层书架上的书籍、黑胶唱片与拍立得相册'
  },
  {
    id: 'typewriter',
    num: '05',
    navLabel: 'CONTACT',
    cnLabel: '打字机',
    sectionTitle: '04 / Contact',
    hint: '写下留言折信盖章，或直接发邮件联系 Lulu'
  },
  {
    id: 'poster',
    num: '06',
    navLabel: 'VALUES',
    cnLabel: '工作信条',
    sectionTitle: '05 / Working values & side projects',
    hint: '查看工作书架四项主题与三个手边的小实验'
  }
];

export const STATION_ALIASES = {
  notebook: 'notebook',
  about: 'notebook',
  bio: 'notebook',
  '00': 'notebook',
  '01': 'notebook',
  tv: 'tv',
  television: 'tv',
  marketing: 'tv',
  work: 'tv',
  '02': 'tv',
  newspaper: 'newspaper',
  press: 'newspaper',
  journalism: 'newspaper',
  paper: 'newspaper',
  '03': 'newspaper',
  shelf: 'shelf',
  bookshelf: 'shelf',
  books: 'shelf',
  vinyl: 'shelf',
  album: 'shelf',
  '04': 'shelf',
  typewriter: 'typewriter',
  contact: 'typewriter',
  letter: 'typewriter',
  mail: 'typewriter',
  '05': 'typewriter',
  poster: 'poster',
  values: 'poster',
  manifesto: 'poster',
  credo: 'poster',
  '06': 'poster'
};

/* ============================================================================
   STATION 01 — CENTRAL NOTEBOOK (100% Verbatim Bio & Timeline)
   ============================================================================ */
export const NOTEBOOK_DATA = {
  cover: {
    archiveCode: 'LU / 个人档案',
    title: '卢倩莹 Lulu',
    subtitle: '营销 × 运营 × 记者',
    footerHint: 'marketing × operations × journalism',
    labelImage: 'notebook_label_1k.png'
  },
  polaroid: {
    boardImage: 'notebook/polaroid-board.jpeg',
    portraitImage: 'notebook/lulu-photo-01.jpg',
    secondaryImage: 'notebook/lulu-photo-02.jpg',
    tapeLabel: 'LU / 2026',
    handwrittenDate: 'Shanghai · Guangzhou',
    handwrittenCaption: '卢倩莹 Lulu',
    secondaryDate: '街边 · 2026',
    secondaryCaption: '工作和生活之间'
  },
  bio: {
    eyebrow: 'creator partnerships · content · operations',
    paragraphs: [
      '我是卢倩莹（Lulu），做海外 KOL 运营、内容策划与项目推进，也做过科创组实习记者，采访过 AI、芯片、游戏等赛道。',
      '擅长把复杂的产品卖点和行业信息，翻译成创作者听得懂、观众愿意看的故事。'
    ],
    marginNote: 'AI products · creator strategy · content systems · global communication',
    philosophyQuote: '我对工作的想象是，既要把事情推进，也要把它做得有趣。'
  },
  timeline: [
    {
      period: '2026.02—11',
      role: '广州凡肆广告有限公司 · KOL 运营',
      tag: '海外 KOL',
      desc: '海外 AI 产品达人合作、报价、脚本共创与发布跟进。月均冷触达 300+，6 个月推动约 165 条内容发布。'
    },
    {
      period: '2025.07—26.01',
      role: '广州维夕信息科技有限公司 · 项目运营',
      tag: '项目运营',
      desc: '负责 50+ 名学生升学规划及面试辅导，协同推进 30+ 个项目并行交付。'
    },
    {
      period: '2024.07—25.04',
      role: '上海聚火信息技术有限公司 · 商业分析师',
      tag: '商业内容',
      desc: '围绕出海、消费与科技产出深度内容，完成品牌商单视频及数据复盘。'
    },
    {
      period: '2024.01—05',
      role: '时代传媒集团有限公司 · 科创组实习记者',
      tag: '科创记者',
      desc: '关注 AI、芯片、游戏赛道，完成产业稿件与采访资源拓展。'
    }
  ],
  sideProjects: [
    {
      num: '01 / system',
      title: '达人管理看板',
      desc: '用 Codex 把联系人、报价、脚本和发布进度整理成一张可追踪的工作台。'
    },
    {
      num: '02 / content',
      title: '内容对标库',
      desc: '把创作者案例拆成开场、节奏、画面和 CTA，帮助脚本共创更快进入状态。'
    },
    {
      num: '03 / play',
      title: '交互式教具',
      desc: '用 Claude、Codex、Figma 和 Gamma 做过教学素材与网页小游戏。'
    }
  ]
};

/* ============================================================================
   STATION 02 — OVERSEAS CREATOR MARKETING (100% Verbatim Campaign & Creator Data)
   ============================================================================ */
export const TV_CHANNELS = [
  {
    key: 'seedance',
    channelNum: '01',
    name: 'Seedance 2.5',
    tapeStat: '$26,250 · 5.6M',
    finderStat: '5 items · $26,250 · 5.6M views · Avg CPM $4.68',
    campaignStats: '5 条内容 · 约 560 万曝光 · 3 条单条破百万',
    intro: '海外红人合作数据与内容链接。数据来自 campaign 汇总截图，链接对应 5 条合作内容。',
    ledgerPills: ['总视频数 5', '总观看量 5.6M', '总互动数 9.9K', '总成本 $26,250', '平均 CPM $4.68'],
    defaultFrame: '→03A'
  },
  {
    key: 'kimi',
    channelNum: '02',
    name: 'Kimi K3',
    tapeStat: '$62,200 · 1.8M',
    finderStat: '5 selected (26 total) · $62,200 · 1.8M views · Avg CPM $41.57',
    campaignStats: '26 条内容 · 1.8M 观看 · 37.2K 互动',
    intro: '公司整体 campaign 数据与 selected work。数据来自 campaign 汇总截图。',
    ledgerPills: ['总视频数 26', '总观看量 1.8M', '总互动数 37.2K', '总成本 $62,200', '平均 CPM $41.57'],
    defaultFrame: '→06A'
  },
  {
    key: 'minimax',
    channelNum: '03',
    name: 'MiniMax M3.1',
    tapeStat: '$2,020 · 90.9K',
    finderStat: '6 selected (13 total) · $2,020 · 90.9K views · Avg CPM $22.22',
    campaignStats: '13 条内容 · 90.9K 观看 · 1.1K 互动',
    intro: '公司整体 campaign 数据与 selected work。数据来自 campaign 汇总截图。',
    ledgerPills: ['总视频数 13', '总观看量 90.9K', '总互动数 1.1K', '总成本 $2,020', '平均 CPM $22.22'],
    defaultFrame: '→11A'
  }
];

export const TV_ALL_CHANNEL = {
  key: 'all',
  channelNum: 'ALL',
  name: 'All Campaigns',
  tapeStat: '$90,470 · 7.49M',
  finderStat: '16 selected (44 total) · $90,470 · 7.49M views',
  campaignStats: '44 条内容 · 7.49M 观看 · 48.2K 互动',
  intro: 'Seedance 2.5 · Kimi K3 · MiniMax M3.1 全部 16 条合作内容。',
  ledgerPills: ['总视频数 44 (精选 16)', '总观看量 7.49M', '总互动数 48.2K', '总成本 $90,470'],
  defaultFrame: '→03A'
};

export const CREATOR_REELS = [
  /* --- CH 01: SEEDANCE 2.5 (5 Instagram Reels) --- */
  {
    idx: 1,
    campIdx: '01',
    frame: '→01A',
    campaign: 'seedance',
    origSlot: 'creator 01',
    handle: '@orbits.vfx',
    verbatimMetrics: 'CPM 4.23 · Cost $3,350 · 791.6K views · ER 0.0%',
    url: 'https://www.instagram.com/reels/Db50c6HtdIu/',
    igCode: 'Db50c6HtdIu',
    localMp4: 'videos/ig_Db50c6HtdIu.mp4',
    embedUrl: 'https://www.instagram.com/reel/Db50c6HtdIu/embed/',
    embedType: 'instagram',
    ratio: '9:16',
    posterFile: 'creators/ig_Db50c6HtdIu.jpg'
  },
  {
    idx: 2,
    campIdx: '02',
    frame: '→02A',
    campaign: 'seedance',
    origSlot: 'creator 02',
    handle: '@tippydrea…',
    verbatimMetrics: 'CPM 6.23 · Cost $4,600 · 738.1K views · ER 0.1%',
    url: 'https://www.instagram.com/reel/Db5tExjNRK2/',
    igCode: 'Db5tExjNRK2',
    localMp4: 'videos/ig_Db5tExjNRK2.mp4',
    embedUrl: 'https://www.instagram.com/reel/Db5tExjNRK2/embed/',
    embedType: 'instagram',
    ratio: '9:16',
    posterFile: 'creators/ig_Db5tExjNRK2.jpg'
  },
  {
    idx: 3,
    campIdx: '03',
    frame: '→03A',
    campaign: 'seedance',
    origSlot: 'creator 03',
    handle: '@artzenmedia',
    verbatimMetrics: 'CPM 3.98 · Cost $7,000 · 1.8M views · ER 0.1%',
    url: 'https://www.instagram.com/reel/Db3OYDNyljI/',
    igCode: 'Db3OYDNyljI',
    localMp4: 'videos/ig_Db3OYDNyljI.mp4',
    embedUrl: 'https://www.instagram.com/reel/Db3OYDNyljI/embed/',
    embedType: 'instagram',
    ratio: '9:16',
    posterFile: 'creators/ig_Db3OYDNyljI.jpg'
  },
  {
    idx: 4,
    campIdx: '04',
    frame: '→04A',
    campaign: 'seedance',
    origSlot: 'creator 04',
    handle: '@kaye.creati…',
    verbatimMetrics: 'CPM 4.64 · Cost $5,500 · 1.2M views · ER 0.4%',
    url: 'https://www.instagram.com/reels/Dbx1Suuo1nq/',
    igCode: 'Dbx1Suuo1nq',
    localMp4: 'videos/ig_Dbx1Suuo1nq.mp4',
    embedUrl: 'https://www.instagram.com/reel/Dbx1Suuo1nq/embed/',
    embedType: 'instagram',
    ratio: '9:16',
    posterFile: 'creators/ig_Dbx1Suuo1nq.jpg'
  },
  {
    idx: 5,
    campIdx: '05',
    frame: '→05A',
    campaign: 'seedance',
    origSlot: 'creator 05',
    handle: '@artzenmedia',
    verbatimMetrics: 'CPM 5.10 · Cost $5,800 · 1.1M views · ER 7.7%',
    url: 'https://www.instagram.com/p/DbvO9S3yHmR/',
    igCode: 'DbvO9S3yHmR',
    localMp4: 'videos/ig_DbvO9S3yHmR.mp4',
    embedUrl: 'https://www.instagram.com/p/DbvO9S3yHmR/embed/',
    embedType: 'instagram',
    ratio: '9:16',
    posterFile: 'creators/ig_DbvO9S3yHmR.jpg'
  },

  /* --- CH 02: KIMI K3 (5 YouTube Videos) --- */
  {
    idx: 6,
    campIdx: '01',
    frame: '→06A',
    campaign: 'kimi',
    origSlot: 'selected work 01',
    handle: '@SinghinUSA',
    verbatimMetrics: 'CPM 219.01 · Cost $2,000 · 9.1K views · ER 2.0%',
    url: 'https://www.youtube.com/watch?v=pyGDJnSbO1U',
    ytId: 'pyGDJnSbO1U',
    embedUrl: 'https://www.youtube.com/embed/pyGDJnSbO1U?autoplay=1&modestbranding=1&rel=0&playsinline=1',
    embedType: 'youtube',
    ratio: '16:9',
    posterFile: 'creators/yt_pyGDJnSbO1U_maxresdefault.jpg'
  },
  {
    idx: 7,
    campIdx: '02',
    frame: '→07A',
    campaign: 'kimi',
    origSlot: 'selected work 02',
    handle: '@CavernaIA',
    verbatimMetrics: 'CPM 180.71 · Cost $1,100 · 6.1K views · ER 6.0%',
    url: 'https://www.youtube.com/watch?v=x2mm82j7Oik',
    ytId: 'x2mm82j7Oik',
    embedUrl: 'https://www.youtube.com/embed/x2mm82j7Oik?autoplay=1&modestbranding=1&rel=0&playsinline=1',
    embedType: 'youtube',
    ratio: '16:9',
    posterFile: 'creators/yt_x2mm82j7Oik_maxresdefault.jpg'
  },
  {
    idx: 8,
    campIdx: '03',
    frame: '→08A',
    campaign: 'kimi',
    origSlot: 'selected work 03',
    handle: '@aifolksorg',
    verbatimMetrics: 'CPM 152.38 · Cost $800 · 5.3K views · ER 6.7%',
    url: 'https://www.youtube.com/watch?v=HGYkadYBaPg',
    ytId: 'HGYkadYBaPg',
    embedUrl: 'https://www.youtube.com/embed/HGYkadYBaPg?autoplay=1&modestbranding=1&rel=0&playsinline=1',
    embedType: 'youtube',
    ratio: '16:9',
    posterFile: 'creators/yt_HGYkadYBaPg_maxresdefault.jpg'
  },
  {
    idx: 9,
    campIdx: '04',
    frame: '→09A',
    campaign: 'kimi',
    origSlot: 'selected work 04',
    handle: '@AndrewVik',
    verbatimMetrics: 'CPM 764.90 · Cost $1,900 · 2.5K views · ER 4.7%',
    url: 'https://www.youtube.com/watch?v=6GUDjXh-6g8',
    ytId: '6GUDjXh-6g8',
    embedUrl: 'https://www.youtube.com/embed/6GUDjXh-6g8?autoplay=1&modestbranding=1&rel=0&playsinline=1',
    embedType: 'youtube',
    ratio: '16:9',
    posterFile: 'creators/yt_6GUDjXh-6g8_maxresdefault.jpg'
  },
  {
    idx: 10,
    campIdx: '05',
    frame: '→10A',
    campaign: 'kimi',
    origSlot: 'selected work 05',
    handle: '@AebidUniversity',
    verbatimMetrics: 'CPM 173.04 · Cost $2,600 · 15K views · ER 7.8%',
    url: 'https://www.youtube.com/watch?v=6855bFkdD8Y',
    ytId: '6855bFkdD8Y',
    embedUrl: 'https://www.youtube.com/embed/6855bFkdD8Y?autoplay=1&modestbranding=1&rel=0&playsinline=1',
    embedType: 'youtube',
    ratio: '16:9',
    posterFile: 'creators/yt_6855bFkdD8Y_maxresdefault.jpg'
  },

  /* --- CH 03: MINIMAX M3.1 (6 X Posts) --- */
  {
    idx: 11,
    campIdx: '01',
    frame: '→11A',
    campaign: 'minimax',
    origSlot: 'selected work 01',
    handle: '@painn_x',
    verbatimMetrics: 'CPM 31.67 · Cost $300 · 9.5K views · ER 0.8%',
    url: 'https://x.com/painn_x/status/2113519833186808070',
    localMp4: 'videos/x_painn_x.mp4',
    mp4Url: 'https://video.twimg.com/amplify_video/2113519275050725377/vid/avc1/1420x720/6Ka4bmLxhFprA42i.mp4',
    embedType: 'x',
    ratio: '16:9',
    posterFile: 'creators/x_painn_x_2113519833186808070.jpg'
  },
  {
    idx: 12,
    campIdx: '02',
    frame: '→12A',
    campaign: 'minimax',
    origSlot: 'selected work 02',
    handle: '@kaif9998',
    verbatimMetrics: 'CPM 135.50 · Cost $150 · 1.1K views · ER 2.3%',
    url: 'https://x.com/kaif9998/status/2113280663214571605',
    localMp4: 'videos/x_kaif9998.mp4',
    mp4Url: 'https://video.twimg.com/amplify_video/2113280315720663040/vid/avc1/1198x720/Gl0Aq-J9TD0FGO8k.mp4',
    embedType: 'x',
    ratio: '16:9',
    posterFile: 'creators/x_kaif9998_2113280663214571605.jpg'
  },
  {
    idx: 13,
    campIdx: '03',
    frame: '→13A',
    campaign: 'minimax',
    origSlot: 'selected work 03',
    handle: '@rakibalislamm',
    verbatimMetrics: 'CPM 140.65 · Cost $100 · 711 views · ER 5.2%',
    url: 'https://x.com/rakibalislamm/status/2113134403291660488',
    localMp4: 'videos/x_rakibalislamm.mp4',
    mp4Url: 'https://video.twimg.com/amplify_video/2113134070549168128/vid/avc1/1280x720/8TdORZkSNjsfYb2P.mp4',
    embedType: 'x',
    ratio: '16:9',
    posterFile: 'creators/x_rakibalislamm_2113134403291660488.jpg'
  },
  {
    idx: 14,
    campIdx: '04',
    frame: '→14A',
    campaign: 'minimax',
    origSlot: 'selected work 04',
    handle: '@PenguinWeb3',
    verbatimMetrics: 'CPM 40.53 · Cost $120 · 3K views · ER 2.8%',
    url: 'https://x.com/PenguinWeb3/status/2112933828540948774',
    localMp4: 'videos/x_PenguinWeb3.mp4',
    mp4Url: 'https://video.twimg.com/amplify_video/2112933627117903872/vid/avc1/1280x720/HW2WM-LFom2phlQQ.mp4',
    embedType: 'x',
    ratio: '16:9',
    posterFile: 'creators/x_PenguinWeb3_2112933828540948774.jpg'
  },
  {
    idx: 15,
    campIdx: '05',
    frame: '→15A',
    campaign: 'minimax',
    origSlot: 'selected work 05',
    handle: '@sakatayasha',
    verbatimMetrics: 'CPM 6.00 · Cost $150 · 25K views · ER 1.1%',
    url: 'https://x.com/sakatayasha/status/2112827697030414461',
    localMp4: 'videos/x_sakatayasha.mp4',
    mp4Url: 'https://video.twimg.com/amplify_video/2112827525038759936/vid/avc1/576x576/ldRcVuOgLEwmJAy3.mp4',
    embedType: 'x',
    ratio: '16:9',
    posterFile: 'creators/x_sakatayasha_2112827697030414461.jpg'
  },
  {
    idx: 16,
    campIdx: '06',
    frame: '→16A',
    campaign: 'minimax',
    origSlot: 'selected work 06',
    handle: '@alannnfx',
    verbatimMetrics: 'MiniMax M3.1 Flash · selected work',
    url: 'https://x.com/alannnfx/status/2112827596279054795',
    localMp4: 'videos/x_alannnfx.mp4',
    mp4Url: 'https://video.twimg.com/amplify_video/2112827490641309696/vid/avc1/1280x720/EZy4NOhAFNDPFDvD.mp4',
    embedType: 'x',
    ratio: '16:9',
    posterFile: 'creators/x_alannnfx_2112827596279054795.jpg'
  }
];

/* ============================================================================
   STATION 03 — JOURNALISM ARCHIVE (All 10 Articles on One Single Page, Zero AI Copy)
   ============================================================================ */
export const NEWSPAPER_DATA = {
  kicker: '02 / Journalism archive',
  heading: '记者作品集',
  byline: '卢倩莹 Lulu',
  sections: [
    {
      key: 'insight',
      outlet: '连线 Insight',
      subtag: '人物 · 现场 · 观察',
      intro: '从产业现场出发，记录 AI、科技与商业变化。',
      articles: [
        {
          idx: '01',
          category: '科技商业',
          title: '“AIGC第一股”，给出门问问带来的是光环还是压力？',
          url: 'https://mp.weixin.qq.com/s/EycUVE4GGUKlA8Ev74LYsw?scene=1'
        },
        {
          idx: '02',
          category: '消费商业',
          title: '价格高、利润跌，百果园的高端路难走？',
          url: 'https://mp.weixin.qq.com/s/CFBBOpdVx2PZtAtjwUBHkA?scene=1'
        },
        {
          idx: '03',
          category: '电商观察',
          title: '618之后，淘天再“反思”',
          url: 'https://mp.weixin.qq.com/s/3QSi_dQc7bFYI_oSi-KMzA?scene=1'
        }
      ]
    },
    {
      key: 'times',
      outlet: '时代周报',
      subtag: '城市 · 文化 · 观点',
      intro: '从商业现场、产业变化与职场趋势出发，记录正在发生的变化。',
      articles: [
        {
          idx: '04',
          category: '汽车商业',
          title: '小米造车提速，招店长月薪2万起',
          url: 'https://mp.weixin.qq.com/s/8gt95iZ4-hhcz4yGqoGjxg?scene=1'
        },
        {
          idx: '05',
          category: '科技产业',
          title: '“AI芯片第一股”市值神话破灭',
          url: 'https://mp.weixin.qq.com/s/QPh4RlUZvU7zdjJfqGQSrw?scene=1'
        },
        {
          idx: '06',
          category: '职场趋势',
          title: '花3000元自学AI后，她涨薪了20%！AI产品经理求职者激增十倍',
          url: 'https://mp.weixin.qq.com/s/wj3ywzLYkLiN-32PpHNjYQ'
        }
      ]
    },
    {
      key: 'beijing',
      outlet: '北京青年报',
      subtag: '青年 · 社会 · 现场',
      intro: '关注公共议题、社会现场与人的处境。',
      articles: [
        {
          idx: '07',
          category: '深度报道',
          title: '老师被扩大化举报背后的隐忧：困于自证，选择“躺平”',
          url: 'https://mp.weixin.qq.com/s/S4715WrKzZBmMnxNaCD01g'
        },
        {
          idx: '08',
          category: '深度聚焦',
          title: '境外偷拍网站运营者：每月最多100部“影片”从中国传来',
          url: 'https://mp.weixin.qq.com/s/Z4cDwUU2BChzvJC7iLL8Kw'
        },
        {
          idx: '09',
          category: '深度报道',
          title: '在一场72小时的洪水危机中，认识孩子的“另一面”',
          url: 'https://mp.weixin.qq.com/s/HQs6hxZBm1p49CN2hA1y4Q'
        },
        {
          idx: '10',
          category: '深度聚焦',
          title: '参与“9958”配捐后，数十名白血病患儿的近千万救命钱被卷走',
          url: 'https://mp.weixin.qq.com/s/K-JQElQRlfVBa3jD0NP_Qw'
        }
      ]
    }
  ]
};

/* ============================================================================
   STATION 04 — TWO-TIER WALNUT SHELF (Books, Vinyls & Polaroid Album)
   ============================================================================ */
export const SHELF_DATA = {
  propTitles: {
    folio: 'Field Notes',
    cream: 'The Quiet Hours',
    olive: 'A Sense of Place'
  },
  books: [
    {
      id: 'book-growth-hacker',
      kind: 'book',
      title: '《增长黑客》',
      cleanTitle: '增长黑客',
      subtitle: '创业公司的用户与收入增长秘籍',
      author: '范冰 著 · 电子工业出版社',
      coverImage: 'book_01_growth_hacker.jpg',
      spineColor: '#1a191b',
      heightPx: 154,
      widthPx: 102,
      shelfNote: '案头常翻的增长实验与数据复盘参考。'
    },
    {
      id: 'book-good-life',
      kind: 'book',
      title: '《何为良好生活》',
      cleanTitle: '何为良好生活',
      subtitle: '行之于途而应于心',
      author: '陈嘉映 著 · 上海文艺出版社',
      coverImage: 'book_02_good_life.jpg',
      spineColor: '#bfa682',
      heightPx: 148,
      widthPx: 98,
      shelfNote: '回到具体的实践、诚实的判断与清晰的表达。'
    },
    {
      id: 'book-mountains',
      kind: 'book',
      title: '《念念远山》',
      cleanTitle: '念念远山',
      subtitle: 'Mountains of the Mind',
      author: '[英] 罗伯特·麦克法伦 著 · 南海出版公司',
      coverImage: 'book_03_niannian_yuanshan.jpg',
      spineColor: '#8eb7dc',
      heightPx: 160,
      widthPx: 106,
      shelfNote: '长途采访与户外观山时最常重读的一本自然文学。'
    }
  ],
  vinyls: [
    {
      id: 'vinyl-faye-wong',
      kind: 'vinyl',
      title: '王菲《只爱陌生人》',
      artist: '王菲 Faye Wong',
      albumTitle: '只爱陌生人',
      year: '1999 · EMI',
      coverImage: 'vinyl_01_faye_wong_lovers_and_strangers.jpg',
      labelImage: 'vinyl_label_01_faye_wong.png',
      sleeveTint: '#d75c74',
      shelfNote: '深夜写稿时的固定背景音。'
    },
    {
      id: 'vinyl-mla',
      kind: 'vinyl',
      title: 'my little airport《介乎法国与旺角的诗意》',
      artist: 'my little airport',
      albumTitle: '介乎法国与旺角的诗意',
      year: '2009 · Harbour Records',
      coverImage: 'vinyl_02_mla_poetics.jpg',
      labelImage: 'vinyl_label_02_mla_poetics.png',
      sleeveTint: '#2b598c',
      shelfNote: '把日常琐碎与城市街角写成散文诗。'
    },
    {
      id: 'vinyl-abbey-road',
      kind: 'vinyl',
      title: 'The Beatles《Abbey Road》',
      artist: 'The Beatles',
      albumTitle: 'Abbey Road',
      year: '1969 · Apple Records',
      coverImage: 'vinyl_03_beatles_abbey_road.jpg',
      labelImage: 'vinyl_label_03_abbey_road.png',
      sleeveTint: '#4f7c56',
      shelfNote: 'Side B 组曲的转场与节奏感百听不厌。'
    }
  ],
  album: {
    id: 'album-polaroids',
    kind: 'album',
    title: '拍立得相册',
    shortTitle: '拍立得相册',
    subtitle: 'Polaroid 600 · 日常切片',
    coverLabelImage: 'album_front_label.png',
    spreads: [
      {
        spreadNum: '01 / 03',
        spreadTitle: '河岸与夜灯',
        photos: [
          {
            code: '01',
            scene: 'suzhou-creek',
            date: '2024.10 · Shanghai',
            caption: '苏州河畔傍晚五点半的逆光。',
            tilt: -2.2
          },
          {
            code: '02',
            scene: 'newsroom-lamp',
            date: '2024.04 · Guangzhou',
            caption: '截稿夜的绿罩台灯与采访本。',
            tilt: 1.8
          }
        ]
      },
      {
        spreadNum: '02 / 03',
        spreadTitle: '骑楼与电车',
        photos: [
          {
            code: '03',
            scene: 'arcade-rain',
            date: '2025.08 · Guangzhou',
            caption: '阵雨过后的骑楼树影。',
            tilt: 1.5
          },
          {
            code: '04',
            scene: 'tram-neon',
            date: '2025.12 · Hong Kong',
            caption: '叮叮车擦过轩尼诗道暮色。',
            tilt: -2.0
          }
        ]
      },
      {
        spreadNum: '03 / 03',
        spreadTitle: '远山与书桌',
        photos: [
          {
            code: '05',
            scene: 'mountain-mist',
            date: '2026.03 · Trail',
            caption: '云海翻过山脊的那几分钟。',
            tilt: -1.6
          },
          {
            code: '06',
            scene: 'sunlit-desk',
            date: '2026.09 · Studio',
            caption: '周六早晨书桌上的阳光与咖啡。',
            tilt: 2.1
          }
        ]
      }
    ]
  }
};

/* ============================================================================
   STATION 05 — CONTACT / TYPEWRITER (100% Verbatim Copy)
   ============================================================================ */
export const TYPEWRITER_DATA = {
  stickyNoteText: '欢迎给我留言！：）',
  headlineEn: "Let's make something move.",
  intro: '如果你正在做一个有想法的 AI 产品，或者想一起把创作者合作做得更顺、更有趣，欢迎来找我。',
  typedGreeting: '欢迎给我留言！：）',
  fields: {
    nameLabel: '署名',
    namePlaceholder: '你的名字 / 团队',
    contactLabel: '联系方式',
    contactPlaceholder: '邮箱 / 微信 / X',
    messageLabel: '留言',
    messagePlaceholder: '写点什么……'
  },
  submitLabel: '折信盖章',
  stampWord: 'SENT',
  email: 'louiselu671@gmail.com',
  mailto: 'mailto:louiselu671@gmail.com',
  keyRow: ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'A', 'S', 'D', 'F', 'L', 'U']
};

/* ============================================================================
   STATION 06 — WORKING VALUES POSTER & SIDE PROJECTS (100% Verbatim Copy ONLY)
   ============================================================================ */
export const POSTER_DATA = {
  headlineQuote: '我对工作的想象是，既要把事情推进，也要把它做得有趣。',
  headlineHighlight: '既要把事情推进',
  shelfHeading: '我的工作书架。',
  shelfIntro: '一些持续影响我工作方式的主题。',
  values: [
    {
      num: '01',
      domain: 'AI 产品',
      title: '把复杂能力讲清楚'
    },
    {
      num: '02',
      domain: 'Creator strategy',
      title: '找到合适的人和语气'
    },
    {
      num: '03',
      domain: 'Journalism',
      title: '先问问题，再做内容'
    },
    {
      num: '04',
      domain: 'Visual systems',
      title: '让信息有秩序地出现'
    }
  ],
  sideKicker: 'Side project / 01—03',
  sideHeading: '手边的小实验。',
  sideIntro: '工作之外，我会把日常遇到的工具、内容和想法做成小型实验。',
  sideProjects: [
    {
      num: '01 / system',
      title: '达人管理看板',
      desc: '用 Codex 把联系人、报价、脚本和发布进度整理成一张可追踪的工作台。'
    },
    {
      num: '02 / content',
      title: '内容对标库',
      desc: '把创作者案例拆成开场、节奏、画面和 CTA，帮助脚本共创更快进入状态。'
    },
    {
      num: '03 / play',
      title: '交互式教具',
      desc: '用 Claude、Codex、Figma 和 Gamma 做过教学素材与网页小游戏。'
    }
  ]
};

export const LuluStudioData = {
  STUDIO_META,
  EDITIONS,
  STATIONS,
  STATION_ALIASES,
  NOTEBOOK_DATA,
  TV_CHANNELS,
  TV_ALL_CHANNEL,
  CREATOR_REELS,
  NEWSPAPER_DATA,
  SHELF_DATA,
  TYPEWRITER_DATA,
  POSTER_DATA
};

if (typeof window !== 'undefined') {
  window.LuluStudioData = LuluStudioData;
}

export default LuluStudioData;
