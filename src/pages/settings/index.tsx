import React from 'react';
import { Button, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { api } from '@/services/api';
import { getUser, hasSession, requireLogin, showError } from '@/services/session';
import styles from './index.module.scss';

export default function Settings() {
  const user = getUser();
  const [loggingOut, setLoggingOut] = React.useState(false);

  const logout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await api.logout();
      Taro.showToast({ title: '已退出', icon: 'success' });
      Taro.switchTab({ url: '/pages/mine/index' });
    } catch (error) {
      showError(error);
    } finally {
      setLoggingOut(false);
    }
  };

  return <View className={styles.page}>
    <Text className={styles.title}>设置</Text>
    <Text className={styles.sub}>管理你的账号。</Text>
    {hasSession() && user ? <View className={styles.account}>
      <Text className={styles.accountLabel}>当前账号</Text>
      <Text className={styles.accountName}>{user.name || '同学'}</Text>
      <Text className={styles.accountId}>{user.loginName || '已登录账号'}</Text>
      <Button className={styles.secondary} disabled={loggingOut} onClick={logout}>{loggingOut ? '退出中…' : '退出当前账号'}</Button>
    </View> : <View className={styles.account}>
      <Text className={styles.accountName}>请先登录</Text>
      <Button className={styles.secondary} onClick={() => requireLogin()}>登录 / 注册</Button>
    </View>}
  </View>;
}
