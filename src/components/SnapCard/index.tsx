import { useEffect, useState } from 'react';
import { Image, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { categoryName, formatTime, type Snap } from '@/types/domain';
import styles from './index.module.scss';

export default function SnapCard({ snap }: { snap: Snap }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [snap.snapImage]);
  return <View className={styles.card} onClick={() => Taro.navigateTo({ url: `/pages/detail/index?id=${snap.snapId}` })}>
    <View className={styles.cover}>
      {snap.snapImage && !failed ? <Image className={styles.image} src={snap.snapImage} mode='aspectFill' lazyLoad
        onError={() => { console.error('[SnapCard] Image failed', snap.snapId); setFailed(true); }} /> : <View className={styles.fallback}><Text className={styles.fallbackMark}>✦</Text></View>}
      <Text className={styles.coverTag}>{categoryName(snap.type)}</Text>
    </View>
    <View className={styles.content}>
      <Text className={styles.description}>{snap.desc}</Text>
      <View className={styles.person}><Text className={styles.avatar}>{(snap.userName || '同')[0]}</Text><Text className={styles.name}>{snap.userName || '同学'}</Text></View>
      <View className={styles.foot}><Text className={styles.meta}>{snap.major || '同频校园'}</Text><Text className={styles.type}>{categoryName(snap.type)}</Text><Text className={styles.time}>{formatTime(snap.ctime)}</Text></View>
    </View>
  </View>;
}
