import React from 'react';
import { Button, Input, Text, Textarea, View } from '@tarojs/components';
import Taro, { usePullDownRefresh, useReachBottom, useRouter } from '@tarojs/taro';
import { usePaged, useResource } from '@/hooks/useResource';
import SnapCard from '@/components/SnapCard';
import { api } from '@/services/api';
import { getUser, hasSession, requireLogin, showError } from '@/services/session';
import type { Snap, User } from '@/types/domain';
import styles from '@/pages/profile/index.module.scss';

type ProfileStats = { following: number; followers: number };
const emptyStats: ProfileStats = { following: 0, followers: 0 };
const getNavigationMetrics = () => {
  const system = Taro.getSystemInfoSync();
  const statusBarHeight = system.statusBarHeight || 0;
  const menu = Taro.getMenuButtonBoundingClientRect?.();
  if (!menu) return { height: statusBarHeight + 52, statusBarHeight, rightInset: 14, menuBottom: statusBarHeight + 44 };
  const topGap = Math.max(menu.top - statusBarHeight, 0);
  return {
    height: menu.bottom + topGap,
    statusBarHeight,
    rightInset: Math.max(14, (system.windowWidth || 375) - menu.left + 8),
    menuBottom: menu.bottom
  };
};

export default function ProfileView({ mineView = false }: { mineView?: boolean }) {
  const router = useRouter();
  const [navigation] = React.useState(getNavigationMetrics);
  const cachedUser = getUser();
  const mine = mineView || router.params.mine === '1';
  const id = router.params.id || cachedUser?.userId || '';
  const isSelf = mine || Boolean(cachedUser && String(id) === String(cachedUser.userId));
  const resource = useResource<User>(
    () => isSelf ? (hasSession() ? api.me() : Promise.resolve({ userId: '', name: '' } as User)) : id ? api.profile(id) : Promise.reject(new Error('用户不存在')),
    `${isSelf ? 'mine' : 'profile'}:${id}`
  );
  const stats = useResource<ProfileStats>(() => {
    if (!isSelf || !hasSession()) return Promise.resolve(emptyStats);
    return Promise.all([api.following(), api.followers()]).then(([following, followers]) => ({
      following: following.length, followers: followers.length
    }));
  }, `stats:${isSelf ? id : 'public'}`);
  const snaps = usePaged<Snap>((page, size) => isSelf && hasSession() ? api.mine(page, size) : Promise.resolve([]), `profile-snaps:${isSelf ? id : 'public'}`, 12);
  const [editing, setEditing] = React.useState(router.params.edit === '1');
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [following, setFollowing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [listKind, setListKind] = React.useState<'following' | 'followers' | ''>('');
  const [listUsers, setListUsers] = React.useState<User[]>([]);
  const [listLoading, setListLoading] = React.useState(false);
  const [form, setForm] = React.useState<Record<string, string>>({ name: '', major: '', description: '' });

  React.useEffect(() => {
    if (resource.data) setForm({ name: resource.data.name || '', major: resource.data.major || '', description: resource.data.description || '' });
  }, [resource.data]);

  React.useEffect(() => {
    let active = true;
    if (!isSelf && id && hasSession()) api.followStatus(id).then(value => { if (active) setFollowing(value); }).catch(() => undefined);
    else setFollowing(false);
    return () => { active = false; };
  }, [id, isSelf]);

  usePullDownRefresh(() => Promise.all([resource.reload(), stats.reload(), snaps.reload()]).finally(() => Taro.stopPullDownRefresh()));
  useReachBottom(() => { if (isSelf) snaps.more(); });

  if (!mine && !id) return <View className={styles.page}><View className={styles.emptyState}><Text className={styles.emptyTitle}>用户不存在</Text></View></View>;
  if (resource.error && !resource.data) return <View className={styles.page}><View className={styles.emptyState}><Text className={styles.emptyTitle}>资料加载失败</Text><Text className={styles.emptyCopy}>{resource.error}</Text><Button className={styles.outlineButton} onClick={() => resource.reload()}>重新加载</Button></View></View>;
  if (!resource.data) return <View className={styles.page}><View className={styles.loading}><View className={styles.spinner} /><Text>正在加载个人资料</Text></View></View>;

  const user = resource.data;
  const topbarStyle = {
    height: `${navigation.height}px`,
    paddingTop: `${navigation.statusBarHeight}px`,
    paddingRight: `${navigation.rightInset}px`
  };
  const menuStyle = { top: `${navigation.menuBottom + 8}px` };
  const profileStats = stats.data || emptyStats;
  const snapCount = snaps.loading && !snaps.data.length ? '—' : `${snaps.data.length}${snaps.hasMore ? '+' : ''}`;
  const avatarLetter = (user.name || '同').slice(0, 1);
  const update = (key: string) => (event: any) => setForm(previous => ({ ...previous, [key]: event.detail.value }));

  const openUserList = async (kind: 'following' | 'followers') => {
    if (!isSelf || !requireLogin()) return;
    setListKind(kind);
    setListLoading(true);
    try { setListUsers(kind === 'following' ? await api.following() : await api.followers()); }
    catch (error) { showError(error); setListKind(''); }
    finally { setListLoading(false); }
  };

  const save = async () => {
    if (saving) return;
    setSaving(true);
    try { await api.updateProfile(form); Taro.showToast({ title: '已保存', icon: 'success' }); setEditing(false); resource.reload(); }
    catch (error) { showError(error); }
    finally { setSaving(false); }
  };

  const toggleFollow = async () => {
    if (!requireLogin()) return;
    try { const next = await api.follow(user.userId); setFollowing(next); Taro.showToast({ title: next ? '已关注' : '已取消关注', icon: 'success' }); }
    catch (error) { showError(error); }
  };

  const addFriend = async () => {
    setMenuOpen(false);
    if (isSelf || String(user.userId) === String(cachedUser?.userId)) { Taro.showToast({ title: '这是你自己的主页', icon: 'none' }); return; }
    if (!requireLogin()) return;
    if (following) { Taro.showToast({ title: '已经是好友了', icon: 'none' }); return; }
    try { setFollowing(await api.follow(user.userId)); Taro.showToast({ title: '已添加好友', icon: 'success' }); }
    catch (error) { showError(error); }
  };

  const openSettings = () => { setMenuOpen(false); Taro.navigateTo({ url: '/pages/settings/index' }); };
  const shareProfile = () => { Taro.showShareMenu({ withShareTicket: true }).catch(() => Taro.showToast({ title: '请使用右上角菜单分享', icon: 'none' })); };

  if (mine && !hasSession()) return <View className={styles.page}><View className={styles.topbar} style={topbarStyle}><Text className={styles.iconButton} /><Text className={styles.topbarTitle}>我的</Text><View className={styles.topbarActionSpacer} /></View><View className={styles.emptyState}><Text className={styles.emptyIcon}>同</Text><Text className={styles.emptyTitle}>登录后查看个人主页</Text><Text className={styles.emptyCopy}>登录后管理个人资料、关注和动态。</Text><Button className={styles.primaryButton} onClick={() => requireLogin()}>登录 / 注册</Button></View></View>;

  return <View className={styles.page}>
    <View className={styles.topbar} style={topbarStyle}>
      <Text className={styles.iconButton} onClick={() => isSelf ? setMenuOpen(true) : Taro.navigateBack()} aria-label={isSelf ? '打开更多选项' : '返回'}>{isSelf ? '⋯' : '‹'}</Text>
      <Text className={styles.topbarTitle}>{isSelf ? '我的' : '个人主页'}</Text>
      {!isSelf ? <Text className={styles.topbarAction} onClick={shareProfile}>分享</Text> : <View className={styles.topbarActionSpacer} />}
    </View>
    <View className={styles.profileBody}>
      <View className={styles.identity}><Text className={styles.avatar}>{avatarLetter}</Text><View className={styles.identityCopy}><Text className={styles.name}>{user.name || '同学'}</Text><Text className={styles.major}>{user.major || '校园同学'}</Text><Text className={styles.userId}>同频号 {user.userId}</Text></View></View>
      <Text className={styles.bio}>{user.description || '还没有填写个人简介。'}</Text>
      <View className={styles.profileActions}>
        <View className={styles.stats}>
          <View className={`${styles.stat} ${isSelf ? styles.statInteractive : ''}`} onClick={() => openUserList('following')}><Text className={styles.statValue}>{isSelf ? profileStats.following : '—'}</Text><Text className={styles.statLabel}>关注</Text></View>
          <View className={`${styles.stat} ${isSelf ? styles.statInteractive : ''}`} onClick={() => openUserList('followers')}><Text className={styles.statValue}>{isSelf ? profileStats.followers : '—'}</Text><Text className={styles.statLabel}>粉丝</Text></View>
          <View className={styles.stat}><Text className={styles.statValue}>{isSelf ? snapCount : '—'}</Text><Text className={styles.statLabel}>动态</Text></View>
        </View>
        {isSelf && !editing && <Button className={styles.editButton} onClick={() => setEditing(true)}>编辑资料</Button>}
      </View>
      {!editing && !isSelf && <View className={styles.actions}><Button className={styles.primaryButton} onClick={toggleFollow}>{following ? '已关注' : '关注'}</Button><Button className={styles.outlineButton} onClick={() => { if (requireLogin()) Taro.navigateTo({ url: `/pages/chat/index?peerId=${user.userId}&name=${encodeURIComponent(user.name)}` }); }}>发私信</Button></View>}
      {editing && <View className={styles.editPanel}><Text className={styles.editTitle}>编辑个人资料</Text><Text className={styles.label}>昵称</Text><Input className={styles.input} value={form.name} onInput={update('name')} /><Text className={styles.label}>专业</Text><Input className={styles.input} value={form.major} onInput={update('major')} /><Text className={styles.label}>个人简介</Text><Textarea className={styles.textarea} value={form.description} maxlength={200} onInput={update('description')} /><View className={styles.editActions}><Button className={styles.outlineButton} onClick={() => setEditing(false)}>取消</Button><Button className={styles.primaryButton} disabled={saving} onClick={save}>{saving ? '保存中…' : '保存资料'}</Button></View></View>}
      {!editing && <View className={styles.contentSection}><View className={styles.tabs}><Text className={styles.tabActive}>动态</Text></View>{snaps.error && <Text className={styles.snapError}>{snaps.error}</Text>}<View className={styles.snapGrid}>{snaps.data.map(snap => <SnapCard key={snap.snapId} snap={snap} />)}</View>{snaps.loading && <Text className={styles.listStatus}>正在加载动态…</Text>}{!snaps.loading && !snaps.data.length && <View className={styles.emptyState}><Text className={styles.emptyIcon}>✦</Text><Text className={styles.emptyTitle}>{isSelf ? '分享你的校园动态' : '暂无公开动态'}</Text><Text className={styles.emptyCopy}>{isSelf ? '去发布页面，记录一次同频邀约。' : '等对方发布新的校园动态吧。'}</Text>{isSelf && <Button className={styles.outlineButton} onClick={() => Taro.switchTab({ url: '/pages/publish/index' })}>去发布</Button>}</View>}{snaps.data.length > 0 && <Text className={styles.listStatus}>{snaps.hasMore ? '上滑加载更多' : '已经到底了'}</Text>}</View>}
    </View>
    {menuOpen && <View className={styles.menuLayer}><View className={styles.menuMask} onClick={() => setMenuOpen(false)} /><View className={styles.menuPopup} style={menuStyle}><View className={styles.menuItem} onClick={addFriend}><Text className={styles.menuIcon}>＋</Text><View className={styles.menuCopy}><Text className={styles.menuTitle}>{following ? '已关注' : '添加好友'}</Text><Text className={styles.menuHint}>{following ? '你已关注对方' : '关注对方，建立联系'}</Text></View><Text className={styles.menuArrow}>›</Text></View><View className={styles.menuItem} onClick={openSettings}><Text className={styles.menuIcon}>⚙</Text><View className={styles.menuCopy}><Text className={styles.menuTitle}>设置</Text><Text className={styles.menuHint}>账号设置</Text></View><Text className={styles.menuArrow}>›</Text></View></View></View>}
    {listKind && <View className={styles.listLayer}><View className={styles.listMask} onClick={() => setListKind('')} /><View className={styles.userList}><View className={styles.userListHeader}><Text className={styles.userListTitle}>{listKind === 'following' ? '关注' : '粉丝'}</Text><Text className={styles.drawerClose} onClick={() => setListKind('')}>×</Text></View>{listLoading ? <Text className={styles.listStatus}>正在加载…</Text> : listUsers.length ? listUsers.map(item => <View className={styles.userRow} key={item.userId} onClick={() => { setListKind(''); Taro.navigateTo({ url: `/pages/profile/index?id=${item.userId}` }); }}><Text className={styles.userRowAvatar}>{(item.name || '同').slice(0, 1)}</Text><View className={styles.userRowCopy}><Text className={styles.userRowName}>{item.name || '同学'}</Text><Text className={styles.userRowMajor}>{item.major || '校园同学'}</Text></View><Text className={styles.menuArrow}>›</Text></View>) : <Text className={styles.listStatus}>还没有{listKind === 'following' ? '关注' : '粉丝'}</Text>}</View></View>}
  </View>;
}
