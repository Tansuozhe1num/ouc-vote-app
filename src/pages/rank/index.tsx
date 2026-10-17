import React from 'react';
import { Button, Image, Text, View } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import { useResource } from '@/hooks/useResource';
import { api } from '@/services/api';
import { categoryName, type Snap } from '@/types/domain';
import styles from './index.module.scss';

function RankEntry({ snap, index, maxScore }: { snap: Snap; index: number; maxScore: number }) {
  const [failed, setFailed] = React.useState(false);
  const score = Number(snap.score) || 0;
  const name = snap.userName || '同学';
  const position = index + 1;
  const tone = position === 1 ? styles.entryFirst : position === 2 ? styles.entrySecond : position === 3 ? styles.entryThird : '';
  const medal = position === 1 ? '✦' : position === 2 ? '✧' : position === 3 ? '✳' : '';
  const width = Math.max(7, Math.min(100, score / maxScore * 100));
  return <View className={`${styles.entry} ${tone}`} onClick={() => Taro.navigateTo({ url: `/pages/detail/index?id=${snap.snapId}` })}>
    <View className={styles.position}><Text className={styles.positionNumber}>{String(position).padStart(2, '0')}</Text>{medal && <Text className={styles.positionMedal}>{medal}</Text>}</View>
    <View className={`${styles.cover} ${!snap.snapImage || failed ? styles.coverEmpty : ''}`}>
      {snap.snapImage && !failed ? <Image className={styles.coverImage} src={snap.snapImage} mode='aspectFill' onError={() => setFailed(true)} /> : <Text>✦</Text>}
    </View>
    <View className={styles.entryCopy}>
      <View className={styles.entryMeta}><Text className={styles.entryType}>{categoryName(snap.type)}</Text><Text className={styles.community}>校园人气</Text></View>
      <Text className={styles.entryDesc}>{snap.desc || '正在寻找同频的你'}</Text>
      <View className={styles.author}><Text className={styles.avatar}>{name[0]}</Text><View><Text className={styles.authorName}>{name}</Text><Text className={styles.authorMajor}>{snap.major || '校园同学'}</Text></View></View>
    </View>
    <View className={styles.score}><Text className={styles.scoreValue}>{score.toLocaleString('zh-CN')}</Text><Text className={styles.scoreLabel}>热度分</Text><View className={styles.meter}><View className={styles.meterFill} style={{ width: `${width}%` }} /></View></View>
    <Text className={styles.entryArrow}>↗</Text>
  </View>;
}

export default function Rank() {
  const resource = useResource(() => api.ranks());
  const entries = resource.data || [];
  const maxScore = Math.max(1, ...entries.map((snap) => Number(snap.score) || 0));
  usePullDownRefresh(() => { resource.reload().finally(() => Taro.stopPullDownRefresh()); });
  return <View className={styles.page}>
    <View className={styles.hero}>
      <View className={styles.heroCopy}>
        <View className={styles.eyebrow}>CAMPUS HOT LIST <View className={styles.live}><View className={styles.liveDot} />实时热度</View></View>
        <Text className={styles.heroTitle}>校园热榜<Text className={styles.heroTitleAccent}>正在升温</Text></Text>
        <Text className={styles.heroSubtitle}>看看最近大家都在寻找什么样的同频搭子。</Text>
        <Button className={styles.refresh} onClick={() => resource.reload()}><Text className={styles.refreshIcon}>↻</Text> 刷新榜单</Button>
      </View>
      <View className={styles.heroArt} aria-hidden='true'>
        <View className={styles.sun} /><View className={`${styles.orbit} ${styles.orbitA}`} /><View className={`${styles.orbit} ${styles.orbitB}`} />
        <Text className={`${styles.artStar} ${styles.starA}`}>✦</Text><Text className={`${styles.artStar} ${styles.starB}`}>✧</Text>
        <Text className={styles.artLabel}>TOP<Text className={styles.artNumber}>10</Text></Text>
      </View>
    </View>
    <View className={styles.sectionHeading}><View><Text className={styles.sectionEyebrow}>TRENDING ON CAMPUS</Text><Text className={styles.sectionTitle}>人气笔记</Text></View><Text className={styles.sectionHint}>热度越高，排名越靠前</Text></View>
    {resource.error && <Text className={styles.error}>{resource.error}</Text>}
    {entries.map((snap, index) => <RankEntry key={snap.snapId} snap={snap} index={index} maxScore={maxScore} />)}
    {resource.loading && <View className={styles.loading}><View className={styles.spinner} />正在整理校园热度…</View>}
    {!resource.loading && !resource.error && !entries.length && <View className={styles.empty}><Text className={styles.emptyIcon}>✦</Text><Text className={styles.emptyTitle}>热榜还在蓄力</Text><Text className={styles.emptyCopy}>等更多同学参与互动，这里就会出现人气笔记。</Text></View>}
  </View>;
}
