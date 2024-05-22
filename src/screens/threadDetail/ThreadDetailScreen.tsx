import axios from 'axios';
import React, {useContext, useEffect, useMemo, useState} from 'react';
import {SectionList, Text, View} from 'react-native';
import {
  Cast,
  CastConversationResponse,
  ConversationSectionList,
} from '../../api/cast/types';
import {RequestStatus} from '../../api/types';
import MyPlaceholderLoader from '../../components/MyPlaceholderLoader';
import UserInfo from '../../components/UserInfo';
import MyComment from '../../components/comment/MyComment';
import MyThread from '../../components/thread/MyThread';
import {AuthContext} from '../../contexts/auth/Auth.context';
import {TransformCast, TransformConversation} from '../../libs/post';
import {RootStackScreenProps} from '../../routing/types';
import {ENDPOINT_CAST} from '../../variables';

function ThreadDetailScreen({
  route,
  navigation,
}: RootStackScreenProps<'ThreadDetail'>) {
  const authContext = useContext(AuthContext);
  const [threadFetchStatus, setThreadFetchStatus] =
    useState<RequestStatus>('idle');
  const [thread, setThread] = useState<Cast>();
  useEffect(() => {
    async function fetchCast() {
      setThreadFetchStatus('loading');
      try {
        const url =
          ENDPOINT_CAST +
          route.params.threadHash +
          '/conversation?replyDepth=5';
        const res = await axios.get<CastConversationResponse>(url, {
          headers: {Authorization: `Bearer ${authContext.state.token}`},
        });
        // console.log('got response');
        setThread(res.data.result.conversation.cast);
        setThreadFetchStatus('success');
      } catch (error) {
        console.error(error);
        setThreadFetchStatus('error');
      }
    }

    fetchCast();
  }, [authContext, route.params.threadHash]);

  const flattenedConversation = useMemo<ConversationSectionList>(
    () =>
      thread ? TransformConversation([thread]) : {casts: [], sections: []},
    [thread],
  );

  console.log('flattenedConversation', JSON.stringify(flattenedConversation));

  if (threadFetchStatus === 'loading') {
    return (
      <View style={{width: '100%', padding: 20}}>
        <MyPlaceholderLoader customStyle={{marginBottom: 20}} />
      </View>
    );
  } else if (thread == null || thread === undefined) {
    return (
      <View>
        <Text>No thread visible</Text>
      </View>
    );
  }

  const threadsHtml = flattenedConversation.casts.map((item, index) => {
    const transformedCast = TransformCast(item);
    return (
      <MyThread
        key={index}
        content={transformedCast.content}
        image={transformedCast.image}
        upvotesCount={transformedCast.upvotesCount}
        commentsCount={transformedCast.commentsCount}
        quotesCount={transformedCast.quotesCount}
      />
    );
  });

  const transformedCast = TransformCast(flattenedConversation.casts[0]);
  return (
    <View>
      <SectionList
        sections={flattenedConversation.sections}
        style={{
          paddingRight: 15,
          paddingLeft: 5,
        }}
        ListHeaderComponent={
          <View
            style={{
              paddingBottom: 15,
              paddingTop: 10,
            }}>
            <UserInfo
              title={transformedCast.headerTitle}
              subtitle={transformedCast.headerSubtitle}
              icon={transformedCast.headerImg}
              customStyle={{
                marginLeft: 10,
              }}
              titleRight={transformedCast.postTime}
            />
            {threadsHtml}
          </View>
        }
        renderSectionHeader={({section}) => {
          const transformedCast = TransformCast(section.header);

          return (
            <MyComment
              headerImg={transformedCast.headerImg}
              postTime={transformedCast.postTime}
              quote={flattenedConversation.casts[section.castIndex].text}
              headerTitle={transformedCast.headerTitle}
              headerSubtitle={transformedCast.headerSubtitle}
              content={transformedCast.content}
              upvotesCount={transformedCast.upvotesCount}
              quotesCount={transformedCast.quotesCount}
              rootCustomStyle={{
                paddingTop: 10,
                marginLeft: 10,
                borderTopLeftRadius: 4,
                borderTopRightRadius: 4,
              }}
              onContentBodyPress={() => {
                navigation.push('ThreadDetail', {
                  threadHash: section.header.hash,
                });
              }}
            />
          );
        }}
        renderItem={({item, index}) => {
          const transformedComment = TransformCast(item);
          return (
            <MyComment
              key={index}
              headerImg={transformedComment.headerImg}
              postTime={transformedComment.postTime}
              headerTitle={transformedComment.headerTitle}
              headerSubtitle={transformedComment.headerSubtitle}
              indentLevel={item.depth}
              content={transformedComment.content}
              image={transformedComment.image}
              upvotesCount={transformedComment.upvotesCount}
              quotesCount={transformedComment.quotesCount}
              rootCustomStyle={{
                marginLeft: 10,
              }}
              onContentBodyPress={() => {
                navigation.push('ThreadDetail', {
                  threadHash: item.hash,
                });
              }}
            />
          );
        }}
        stickySectionHeadersEnabled={false}
        renderSectionFooter={() => (
          <View
            style={{
              height: 10,
              marginTop: -1,
              marginLeft: 10,
              backgroundColor: 'white',
              marginBottom: 20,
              borderBottomLeftRadius: 4,
              borderBottomRightRadius: 4,
              paddingTop: 10,
            }}
          />
        )}
        ListFooterComponent={<View style={{height: 40}} />}
      />
    </View>
  );
}

export default ThreadDetailScreen;
