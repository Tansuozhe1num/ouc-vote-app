import type { Snap } from '@/types/domain';

const picture = (prompt: string) => `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=landscape_4_3`;
const library = picture('Editorial photography, sunlit Chinese university library study desk, open books and notebook, warm afternoon natural light, calm cream tones, realistic, no text, no watermark');
const sea = picture('Editorial travel photography, Qingdao seaside promenade and blue ocean, bright clear afternoon, gentle waves, realistic coastal landscape, no text, no watermark');
const court = picture('Editorial photography of outdoor university basketball court at sunset, pastel orange sky, empty court, warm soft lighting, realistic, no text, no watermark');

// H5-only examples. Never used as a fallback for a failed real API request.
export const demoSnaps: Snap[] = [
  { snapId: 101, userId: 'demo-1', userName: '小林', major: '计算机科学与技术', type: 0, desc: '图书馆靠窗的位置，留一个给你。\n周三下午一起复习算法，专注两小时，再去喝杯咖啡。', snapImage: library, ctime: '1792195200', status: 0, score: 128 },
  { snapId: 102, userId: 'demo-2', userName: '阿沐', major: '海洋科学', type: 1, desc: '周末去海边，把日落装进相机。\n想找一起沿着海岸散步、拍照的同学，慢慢走就好。', snapImage: sea, ctime: '1792191600', status: 0, score: 106 },
  { snapId: 103, userId: 'demo-3', userName: '可可', major: '新闻传播', type: 3, desc: '傍晚六点，球场见！\n不追求技术，出出汗、交个朋友就很开心。', snapImage: court, ctime: '1792188000', status: 0, score: 93 },
  { snapId: 104, userId: 'demo-4', userName: '一颗橙', major: '软件工程', type: 4, desc: '今晚开黑，快乐优先。\n缺一位不着急、不压力队友的游戏搭子，一起玩两局。', ctime: '1792184400', status: 0, score: 82 },
  { snapId: 105, userId: 'demo-5', userName: '知夏', major: '汉语言文学', type: 0, desc: '找一个晨读伙伴。\n每天早上半小时练英语，互相提醒，一起坚持到期末。', ctime: '1792180800', status: 0, score: 71 },
  { snapId: 106, userId: 'demo-6', userName: '慢慢', major: '环境科学', type: 2, desc: '从一杯咖啡开始认识。\n喜欢看展、旧书和散步，希望遇见聊得来的你。', ctime: '1792177200', status: 0, score: 65 },
  { snapId: 107, userId: 'demo-7', userName: '七七', major: '外国语言文学', type: 3, desc: '食堂新品尝鲜小队，等你加入。\n午饭不用再纠结吃什么，我们轮流决定！', ctime: '1792173600', status: 0, score: 52 },
  { snapId: 108, userId: 'demo-8', userName: '山海', major: '海洋技术', type: 1, desc: '下周末一起爬山吗？\n计划轻松路线，带好水和零食，去看看秋天。', ctime: '1792170000', status: 0, score: 43 },
  { snapId: 109, userId: 'demo-9', userName: '阿言', major: '数学与应用数学', type: 0, desc: '数学分析互助小组。\n每周找一个晚上讨论习题，欢迎认真提问的同学。', ctime: '1792166400', status: 0, score: 38 },
  { snapId: 110, userId: 'demo-10', userName: '木木', major: '艺术设计', type: 4, desc: '找喜欢合作解谜游戏的朋友。\n慢慢探索，不看攻略，享受一起发现答案的过程。', ctime: '1792162800', status: 0, score: 29 }
];
