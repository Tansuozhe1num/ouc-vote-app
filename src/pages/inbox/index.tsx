import React from 'react';
import { Button, Text, View } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import { useResource } from '@/hooks/useResource';
import { api } from '@/services/api';
import { hasSession, requireLogin } from '@/services/session';
import { formatTime } from '@/types/domain';
import styles from './index.module.scss';
export default function Inbox() { const resource = useResource(() => api.inbox()); usePullDownRefresh(() => { resource.reload().finally(() => Taro.stopPullDownRefresh()); }); if (!hasSession()) return <View className={styles.page}><Text className={styles.title}>消息</Text><View className={styles.empty}><Text>登录后查看你的私信和会话。</Text><Button className={styles.button} onClick={() => requireLogin()}>去登录</Button></View></View>; return <View className={styles.page}><Text className={styles.eyebrow}>YOUR CONNECTIONS</Text><Text className={styles.title}>消息</Text>{resource.error && <Text className={styles.error}>{resource.error}</Text>}{resource.data?.map((item) => <View className={styles.item} key={item.peerId} onClick={() => Taro.navigateTo({ url: `/pages/chat/index?peerId=${item.peerId}&name=${encodeURIComponent(item.peerName)}` })}><Text className={styles.avatar}>{(item.peerName || '同')[0]}</Text><View className={styles.copy}><Text className={styles.name}>{item.peerName}</Text><Text className={styles.last}>{item.lastContent || '开始一段对话吧'}</Text></View><Text className={styles.time}>{formatTime(item.lastCtime)}</Text></View>)}{!resource.loading && !resource.error && !resource.data?.length && <View className={styles.empty}>还没有会话，去发现页认识新同学吧。</View>}</View>; }


