import React from 'react';
import { Button, Image, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { api } from '@/services/api';
import { categoryName, type Snap } from '@/types/domain';
import { requireLogin, showError } from '@/services/session';
import styles from './index.module.scss';

export default function Draw() {
  const [snap, setSnap] = React.useState<Snap>();
  const [loading, setLoading] = React.useState(false);
  const draw = async () => {
    if (!requireLogin()) return;
    setLoading(true);
    try { setSnap(await api.draw()); } catch (error) { showError(error); } finally { setLoading(false); }
  };
  const openChat = (event: any) => {
    event.stopPropagation();
    if (snap && requireLogin()) Taro.navigateTo({ url: `/pages/chat/index?peerId=${snap.userId}&name=${encodeURIComponent(snap.userName)}` });
  };
  return <View className={styles.page}>
    <View className={styles.copy}>
      <Text className={styles.eyebrow}>A LITTLE SERENDIPITY</Text>
      <Text className={styles.title}>让缘分，{`\n`}从一次随机开始。</Text>
      <Text className={styles.subtitle}>正在寻找搭子的同学，等你来认识。</Text>
      <Button className={styles.drawButton} disabled={loading} onClick={draw}><Text className={styles.drawStar}>✦</Text><Text>{loading ? '缘分正在靠近' : snap ? '再抽一位搭子' : '抽一位搭子'}</Text><Text className={styles.drawArrow}>→</Text></Button>
      <Text className={styles.footnote}>每次抽取都会从当前公开的找搭子动态中随机匹配</Text>
    </View>
    <View className={styles.stage}>
      <View className={`${styles.orbit} ${styles.orbitOne}`} />
      <View className={`${styles.orbit} ${styles.orbitTwo}`} />
      <View className={`${styles.drawCard} ${loading ? styles.drawing : ''} ${snap ? styles.ready : ''}`} onClick={() => snap && Taro.navigateTo({ url: `/pages/detail/index?id=${snap.snapId}` })}>
        {snap?.snapImage ? <Image className={styles.cardArt} src={snap.snapImage} mode="aspectFill" /> : <View className={`${styles.cardArt} ${snap ? styles.cardReady : ''}`}><Text>{snap ? '✦' : '✳'}</Text></View>}
        <View className={styles.cardContent}>
          <Text className={styles.typeLabel}>{snap ? categoryName(snap.type) : '等你来抽取'}</Text>
          <Text className={styles.cardTitle}>{snap ? snap.desc : '下一位同频的人'}</Text>
          <Text className={styles.cardDesc}>{snap ? 'TA 正在校园里，等待一个友好的招呼。' : '点一下按钮，看看今天会遇见谁。'}</Text>
          <View className={styles.person}><Text className={styles.avatar}>{snap ? (snap.userName || '同')[0] : '?'}</Text><View className={styles.personCopy}><Text className={styles.personName}>{snap?.userName || '神秘同学'}</Text><Text className={styles.personMajor}>{snap?.major || '缘分正在路上'}</Text></View><Button className={styles.chat} disabled={!snap} onClick={openChat}>↗</Button></View>
        </View>
      </View>
      <Text className={`${styles.floatNote} ${styles.noteA}`}>一起去做点喜欢的事</Text>
      <Text className={`${styles.floatNote} ${styles.noteB}`}>好巧，你也在找搭子</Text>
    </View>
  </View>;
}
