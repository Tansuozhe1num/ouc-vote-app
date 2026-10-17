import React from 'react';
import { Button, Text, View } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import { useResource } from '@/hooks/useResource';
import { api } from '@/services/api';
import { categoryName, formatTime } from '@/types/domain';
import styles from './index.module.scss';

export default function Rank() { const resource = useResource(() => api.ranks()); usePullDownRefresh(() => { resource.reload().finally(() => Taro.stopPullDownRefresh()); }); return <View className={styles.page}><View className={styles.hero}><Text className={styles.eyebrow}>CAMPUS TRENDING</Text><Text className={styles.title}>热榜</Text><Text className={styles.subtitle}>看看今天大家正在寻找什么。</Text></View><Button className={styles.refresh} onClick={() => resource.reload()}>↻ 刷新热榜</Button>{resource.error && <Text className={styles.error}>{resource.error}</Text>}{resource.data?.map((snap, index) => <View className={styles.item} key={snap.snapId} onClick={() => Taro.navigateTo({ url: `/pages/detail/index?id=${snap.snapId}` })}><Text className={styles.number}>{String(index + 1).padStart(2, '0')}</Text><View className={styles.copy}><Text className={styles.tag}>{categoryName(snap.type)}</Text><Text className={styles.desc}>{snap.desc}</Text><Text className={styles.meta}>{snap.userName} · {formatTime(snap.ctime)}</Text></View><View className={styles.score}><Text>{snap.score || 0}</Text><Text>热度</Text></View></View>)}{!resource.loading && !resource.error && !resource.data?.length && <View className={styles.empty}>暂时还没有上榜内容</View>}</View>; }


