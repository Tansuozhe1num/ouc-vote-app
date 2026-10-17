import React from 'react';
import { Input, ScrollView, Text, View } from '@tarojs/components';
import Taro, { usePullDownRefresh, useReachBottom } from '@tarojs/taro';
import SnapCard from '@/components/SnapCard';
import { usePaged, useResource } from '@/hooks/useResource';
import { api } from '@/services/api';
import { categories, categoryName, formatTime } from '@/types/domain';
import styles from './index.module.scss';

const Index: React.FC = () => {
  const [type, setType] = React.useState('');
  const [keyword, setKeyword] = React.useState('');
  const resource = usePaged((page, size) => api.list(page, size, type), type, 10);
  const rank = useResource(() => api.ranks());
  const intro = {
    '': { title: '在校园里，遇见刚好同频的人。', copy: '自习、出发、运动，下一段日常可以一起。' },
    '0': { title: '校园里，找到一起学习的伙伴。', copy: '分享学习进度，查漏补缺，取长补短。' },
    '1': { title: '说走就走。', copy: '叫上几位伙伴，来一场说走就走的旅程。' },
    '2': { title: '心动不如行动。', copy: '发布动态或主动出击，找到心仪的 ta。' },
    '4': { title: '游戏，多人玩才爽。', copy: '四缺一，速度上号。' },
    '3': { title: '校园生活，一起探索。', copy: '找个活动搭子，让普通的一天多点乐趣。' }
  }[type] || { title: '在校园里，遇见刚好同频的人。', copy: '自习、出发、运动，下一段日常可以一起。' };
  const visible = React.useMemo(() => {
    const value = keyword.trim().toLowerCase();
    return value ? resource.data.filter((item) => `${item.desc} ${item.userName} ${item.major || ''}`.toLowerCase().includes(value)) : resource.data;
  }, [keyword, resource.data]);
  usePullDownRefresh(() => { resource.reload().finally(() => Taro.stopPullDownRefresh()); });
  useReachBottom(() => resource.more());

  return (
    <View className={styles.page}>
      <View className={styles.searchRow}>
        <View className={styles.search}><Input value={keyword} onInput={(e) => setKeyword(e.detail.value)} placeholder="搜索动态、同学或专业" confirmType="search" /><View className={styles.searchIcon} /></View>
      </View>
      <ScrollView scrollX className={styles.categories}>
        {categories.map((item) => <Text key={item.value} className={`${styles.chip} ${type === item.value ? styles.active : ''}`} onClick={() => setType(item.value)}>{item.label}</Text>)}
        <View className={styles.hotChip} onClick={() => Taro.navigateTo({ url: '/pages/rank/index' })}><Text className={styles.hotSpark}>✦</Text><Text>热榜</Text><Text className={styles.hotBadge}>HOT</Text></View>
      </ScrollView>
      <View className={styles.introBlock}><Text className={styles.intro}>{intro.title}</Text><Text className={styles.introSub}>{intro.copy}</Text></View>
      {rank.data?.length ? <View className={styles.trending}><View className={styles.trendingHead}><Text className={styles.trendingTitle}>校园热榜</Text><Text className={styles.trendingMore} onClick={() => Taro.navigateTo({ url: '/pages/rank/index' })}>查看全部 ›</Text></View><ScrollView scrollX className={styles.trendingList}>{rank.data.slice(0, 5).map((snap, index) => <View className={styles.trendingItem} key={snap.snapId} onClick={() => Taro.navigateTo({ url: `/pages/detail/index?id=${snap.snapId}` })}><Text className={styles.trendingNumber}>{String(index + 1).padStart(2, '0')}</Text><Text className={styles.trendingTag}>{categoryName(snap.type)}</Text><Text className={styles.trendingDesc}>{snap.desc}</Text><Text className={styles.trendingMeta}>{snap.userName} · {formatTime(snap.ctime)}</Text></View>)}</ScrollView></View> : null}
      {resource.error && <View className={styles.error}><Text>{resource.error}</Text><Text onClick={() => resource.reload()}>重试</Text></View>}
      {visible.length ? <View className={styles.grid}>{visible.map((snap) => <SnapCard key={snap.snapId} snap={snap} />)}</View> : !resource.loading && <View className={styles.empty}><Text className={styles.emptyTitle}>还没有找到内容</Text><Text>换个关键词，或者成为第一个发布的人。</Text></View>}
      {resource.loading && <Text className={styles.loading}>加载中…</Text>}
      {!resource.hasMore && resource.data.length > 0 && <Text className={styles.loading}>已经到底啦</Text>}
    </View>
  );
};

export default Index;
