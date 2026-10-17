import React from 'react';
import { Button, Input, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { getBaseUrl, setBaseUrl } from '@/services/config';
import { api } from '@/services/api';
import { showError } from '@/services/session';
import styles from './index.module.scss';
export default function Settings(){const [value,setValue]=React.useState(getBaseUrl());const save=()=>{try{setBaseUrl(value);Taro.showToast({title:'已保存',icon:'success'});setTimeout(()=>Taro.navigateBack(),350)}catch(e){showError(e)}};return <View className={styles.page}><Text className={styles.title}>服务设置</Text><Text className={styles.sub}>连接你部署的 vote 服务。正式环境必须使用 HTTPS。</Text><Text className={styles.label}>后端地址</Text><Input className={styles.input} value={value} onInput={e=>setValue(e.detail.value)} placeholder="https://example.com"/><Text className={styles.notice}>保存地址会清除当前会话，避免把旧凭证发送到新服务。</Text><Button className={styles.button} onClick={save}>保存地址</Button><Button className={styles.secondary} onClick={()=>api.logout().then(()=>Taro.showToast({title:'已退出',icon:'success'})).catch(showError)}>退出当前账号</Button></View>}

