import React from 'react';
import { Button, Input, Text, View } from '@tarojs/components';
import { useRouter } from '@tarojs/taro';
import { useResource } from '@/hooks/useResource';
import { api } from '@/services/api';
import { getUser, requireLogin, showError } from '@/services/session';
import { formatTime } from '@/types/domain';
import styles from './index.module.scss';
export default function Chat(){const router=useRouter();const peerId=router.params.peerId||'';const name=router.params.name?decodeURIComponent(router.params.name):'同学';const resource=useResource(()=>api.conversation(peerId),peerId);const [text,setText]=React.useState('');const [sending,setSending]=React.useState(false);const send=async()=>{if(!text.trim()||sending||!requireLogin())return;setSending(true);try{await api.send(peerId,text.trim(),router.params.snapId?Number(router.params.snapId):undefined);setText('');resource.reload()}catch(e){showError(e)}finally{setSending(false)}};return <View className={styles.page}><Text className={styles.title}>{name}</Text><View className={styles.messages}>{resource.data?.map(msg=><View key={msg.id} className={`${styles.message} ${String(msg.senderId)===String(getUser()?.userId)?styles.own:''}`}><Text>{msg.content}</Text><Text className={styles.time}>{formatTime(msg.ctime)}</Text></View>)}</View><View className={styles.composer}><Input value={text} maxlength={1000} onInput={e=>setText(e.detail.value)} placeholder="输入消息" onConfirm={send}/><Button className={styles.button} disabled={sending} onClick={send}>发送</Button></View></View>}


