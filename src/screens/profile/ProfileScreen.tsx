import axios from 'axios';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import {Comment, CommentResponse} from '../../api/cast/types';
import {Profile, ProfileResponse} from '../../api/profile/types';
import {RequestStatus} from '../../api/types';
import {UserCast, UserCastsResponse} from '../../api/user/types';
import MyButton from '../../components/MyButton';
import MyLoader from '../../components/MyLoader';
import MyComment from '../../components/comment/MyComment';
import MyPost from '../../components/post/MyPost';
import MyTabs from '../../components/tabs/MyTabs';
import {AuthContext} from '../../contexts/auth/Auth.context';
import {TransformFeedItem, TransformUserCast} from '../../libs/post';
import {FeedStackScreenProps, HomeTabScreenProps} from '../../routing/types';
import {ENDPOINT_PROFILE} from '../../variables';
import UpperSection from './components/UpperSection';

const HEADER_HEIGHT = 250;

function ProfileScreen({
  route,
  navigation,
}: HomeTabScreenProps<'PersonalProfile'> | FeedStackScreenProps<'Profile'>) {
  const authContext = useContext(AuthContext);
  const [profileFetchStatus, setProfileFetchStatus] =
    useState<RequestStatus>('idle');
  const [profile, setProfile] = useState<Profile>();

  const [selectedTab, setSelectedTab] = useState(0);
  const [commentsFetchStatus, setCommentsFetchStatus] = useState('idle');
  const [comments, setComments] = useState<Comment[]>([]);
  const [userCastsFetchStatus, setUserCastsFetchStatus] = useState('idle');
  const [userCasts, setUserCasts] = useState<UserCast[]>([]);

  const isLoggedUserProfile = useMemo(() => {
    if (!authContext.state?.fid) {
      return false;
    }
    return authContext.state?.fid === route.params.userFid.toString();
  }, [authContext.state?.fid, route.params.userFid]);

  const fetchProfile = useCallback(async () => {
    if (authContext.state?.fid) {
      setProfileFetchStatus('loading');
      try {
        const finalUrl = ENDPOINT_PROFILE + route.params.userFid;
        console.log('fetching profile', finalUrl);
        const res = await axios.get<ProfileResponse>(finalUrl, {
          headers: {Authorization: `Bearer ${authContext.state.token}`},
        });
        console.log('got response', res.data.result);
        // console.log('got response');
        setProfile(res.data.result);
        setProfileFetchStatus('success');
      } catch (error) {
        console.error(error);
        setProfileFetchStatus('error');
      }
    }
  }, [authContext.state.token, authContext.state?.fid, route.params.userFid]);

  const fetchComments = useCallback(async () => {
    if (profile?.fid) {
      setCommentsFetchStatus('loading');
      try {
        const finalUrl =
          ENDPOINT_PROFILE + profile?.fid + '/replies-and-recasts?limit=10';
        const res = await axios.get<CommentResponse>(finalUrl, {
          headers: {Authorization: `Bearer ${authContext.state.token}`},
        });
        console.log('got comments');
        setComments(res.data.result);
        setCommentsFetchStatus('success');
      } catch (error) {
        console.error(error);
        setCommentsFetchStatus('error');
      }
    }
  }, [authContext.state.token, profile?.fid]);

  const fetchThreads = useCallback(async () => {
    if (profile?.fid) {
      setUserCastsFetchStatus('loading');
      try {
        const finalUrl = ENDPOINT_PROFILE + profile?.fid + '/casts?limit=10';
        const res = await axios.get<UserCastsResponse>(finalUrl, {
          headers: {Authorization: `Bearer ${authContext.state.token}`},
        });
        console.log('got threads');
        setUserCasts(res.data.result);
        setUserCastsFetchStatus('success');
      } catch (error) {
        console.error(error);
        setUserCastsFetchStatus('error');
      }
    }
  }, [authContext.state.token, profile?.fid]);

  const jumpToFeedRoot = useCallback(
    (screen: 'Profile' | 'ThreadDetail' | 'Channel', params: any) => {
      navigation.jumpTo('FeedRoot', {
        screen,
        params,
      });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({item, index}: {item: UserCast | Comment; index: number}) => {
      if (
        userCastsFetchStatus !== 'success' ||
        commentsFetchStatus !== 'success'
      ) {
        return null;
      }
      if (selectedTab === 0) {
        const transformedItem = TransformUserCast(item as UserCast);

        return (
          <MyPost
            postHash={item.hash}
            headerImg={transformedItem.headerImg}
            postTime={transformedItem.postTime}
            headerTitle={transformedItem.headerTitle}
            headerSubtitle={transformedItem.headerSubtitle}
            content={transformedItem.content}
            image={transformedItem.image}
            // TODO: implement upvote and recast
            recasted={false}
            upvoted={false}
            upvotesCount={transformedItem.upvotesCount}
            commentsCount={transformedItem.commentsCount}
            quotesCount={transformedItem.quotesCount}
            customStyle={{
              marginHorizontal: 15,
              marginBottom: 15,
              marginTop: index === 0 ? 15 : 0,
            }}
            onContentBodyPress={() => {
              jumpToFeedRoot('ThreadDetail', {
                threadHash: item.hash,
              });
            }}
            onHeaderTitlePress={() => {
              if (transformedItem.channel !== '') {
                jumpToFeedRoot('Channel', {
                  channelId: transformedItem.channel,
                });
              } else {
                jumpToFeedRoot('Profile', {
                  userFid: item.author.fid.toString(),
                });
              }
            }}
            onHeaderSubtitlePress={() => {
              jumpToFeedRoot('Profile', {
                userFid: item.author.fid.toString(),
              });
            }}
            onHeaderImagePress={() => {
              if (transformedItem.channel !== '') {
                jumpToFeedRoot('Channel', {
                  channelId: transformedItem.channel,
                });
              } else {
                jumpToFeedRoot('Profile', {
                  userFid: item.author.fid.toString(),
                });
              }
            }}
          />
        );
      } else {
        const transformedItem = TransformFeedItem(item as Comment);

        return (
          <MyComment
            headerImg={transformedItem.headerImg}
            postTime={transformedItem.postTime}
            headerTitle={transformedItem.headerTitle}
            headerSubtitle={transformedItem.headerSubtitle}
            content={transformedItem.content}
            quote="test quote text"
            quoteTitle="@handle"
            image={transformedItem.image}
            upvotesCount={transformedItem.upvotesCount}
            quotesCount={transformedItem.quotesCount}
            rootCustomStyle={[
              styles.comment,
              {
                marginTop: index === 0 ? 15 : 0,
              },
            ]}
            hideActionBar
            onContentBodyPress={() => {
              jumpToFeedRoot('ThreadDetail', {
                threadHash: item.hash,
              });
            }}
            onHeaderTitlePress={() => {
              if (transformedItem.channel !== '') {
                jumpToFeedRoot('Channel', {
                  channelId: transformedItem.channel,
                });
              } else {
                jumpToFeedRoot('Profile', {
                  userFid: item.author.fid.toString(),
                });
              }
            }}
            onHeaderSubtitlePress={() => {
              jumpToFeedRoot('Profile', {
                userFid: item.author.fid.toString(),
              });
            }}
            onHeaderImagePress={() => {
              if (transformedItem.channel !== '') {
                jumpToFeedRoot('Channel', {
                  channelId: transformedItem.channel,
                });
              } else {
                jumpToFeedRoot('Profile', {
                  userFid: item.author.fid.toString(),
                });
              }
            }}
          />
        );
      }
    },
    [selectedTab, userCastsFetchStatus, commentsFetchStatus, jumpToFeedRoot],
  );

  useEffect(() => {
    fetchProfile();
  }, [authContext, authContext.state?.fid, fetchProfile]);

  useEffect(() => {
    if (profile) {
      fetchComments();
    }
  }, [profile, fetchComments]);
  useEffect(() => {
    if (profile) {
      fetchThreads();
    }
  }, [profile, fetchThreads]);

  if (profileFetchStatus === 'loading') {
    return (
      <View style={styles.loadingCtn}>
        <MyLoader />
      </View>
    );
  } else if (profileFetchStatus === 'error') {
    return (
      <View style={styles.errorCtn}>
        <MyButton title="Retry" width={'auto'} onPress={() => fetchProfile()} />
      </View>
    );
  } else if (!profile) {
    return (
      <View style={styles.errorCtn}>
        <Text>Profile not found</Text>
      </View>
    );
  }

  // if (userCastsFetchStatus === 'loading' || commentsFetchStatus === 'loading') {
  //   return (
  //     <View style={styles.loadingCtn}>
  //       <MyLoader />
  //     </View>
  //   );
  // } else if (
  //   userCastsFetchStatus === 'error' ||
  //   commentsFetchStatus === 'error'
  // ) {
  //   return (
  //     <View style={styles.errorCtn}>
  //       <MyButton
  //         title="Retry"
  //         width={'auto'}
  //         onPress={() => {
  //           if (userCastsFetchStatus === 'error') {
  //             fetchThreads();
  //           } else {
  //             fetchComments();
  //           }
  //         }}
  //       />
  //     </View>
  //   );
  // }

  return (
    <FlatList
      data={selectedTab === 0 ? userCasts : comments}
      windowSize={5}
      ListHeaderComponent={
        <View style={styles.profileCtn}>
          <UpperSection profile={profile} isLoggedUser={isLoggedUserProfile} />
          <View style={{padding: 15}}>
            <MyTabs
              tabs={['Threads', 'Comments', 'About']}
              selectedTab={selectedTab}
              onPress={setSelectedTab}
            />
          </View>
          {userCastsFetchStatus === 'loading' ||
          commentsFetchStatus === 'loading' ? (
            <View style={styles.loadingCtn}>
              <MyLoader />
            </View>
          ) : userCastsFetchStatus === 'error' ||
            commentsFetchStatus === 'error' ? (
            <View style={styles.errorCtn}>
              <MyButton
                title="Retry"
                width={'auto'}
                onPress={() => {
                  if (userCastsFetchStatus === 'error') {
                    fetchThreads();
                  } else {
                    fetchComments();
                  }
                }}
              />
            </View>
          ) : null}
        </View>
      }
      renderItem={renderItem}
      keyExtractor={(item, _) => item.hash}
    />
  );
}

const styles = StyleSheet.create({
  loadingCtn: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    paddingBottom: 100,
  },
  errorCtn: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    paddingBottom: 100,
  },
  profileCtn: {
    flex: 1,
  },
  upperSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  box: {
    height: 250,
    width: '100%',
  },
  boxA: {
    backgroundColor: 'white',
  },
  boxB: {
    backgroundColor: '#D8D8D8',
  },
  header: {
    height: HEADER_HEIGHT,
    width: '100%',
    backgroundColor: '#2196f3',
  },
  comment: {
    marginBottom: 15,
    marginHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 4,
  },
});

export default ProfileScreen;
