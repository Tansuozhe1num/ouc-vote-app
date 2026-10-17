import React from 'react';
import { Button, Image, Input, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { api } from '@/services/api';
import { showError } from '@/services/session';
import styles from './index.module.scss';
export default function Auth() { const [register, setRegister] = React.useState(false); const [fields, setFields] = React.useState<Record<string,string>>({}); const [captcha, setCaptcha] = React.useState<{key:string;image:string}>(); const [busy,setBusy]=React.useState(false); const refresh=()=>api.captcha().then(setCaptcha).catch(showError); React.useEffect(() => { void refresh(); }, []); const update=(key:string)=>(e:any)=>setFields({...fields,[key]:e.detail.value}); const submit=async()=>{setBusy(true);try{await api.login({...fields,captchaKey:captcha?.key},register); Taro.showToast({title:'登录成功',icon:'success'}); setTimeout(()=>Taro.navigateBack(),350);}catch(e){showError(e);}finally{setBusy(false);}}; return <View className={styles.page}><Text className={styles.eyebrow}>WELCOME TO CAMPUS</Text><Text className={styles.title}>{register?'创建你的账号':'欢迎回来'}</Text><View className={styles.tabs}><Text className={!register?styles.active:''} onClick={()=>setRegister(false)}>登录</Text><Text className={register?styles.active:''} onClick={()=>setRegister(true)}>注册</Text></View>{register&&<Input className={styles.input} placeholder="昵称" onInput={update('name')}/>}<Input className={styles.input} placeholder="账号" onInput={update('loginName')}/><Input className={styles.input} password placeholder="密码" onInput={update('password')}/>{register&&<Input className={styles.input} placeholder="专业（可选）" onInput={update('major')}/>}<View className={styles.captchaRow}><Input className={styles.captchaInput} placeholder="验证码" onInput={update('captchaCode')}/>{captcha?<Image className={styles.captcha} src={captcha.image.startsWith('data:')?captcha.image:`data:image/png;base64,${captcha.image}`} onClick={refresh}/>:<Text onClick={refresh}>点击加载</Text>}</View><Button className={styles.button} disabled={busy} onClick={submit}>{busy?'提交中…':register?'注册并加入':'登录'}</Button><Text className={styles.tip}>密码只用于本次登录，不会保存在设备上。</Text></View>; }




