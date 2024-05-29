import React, {RefObject} from 'react';
import {
  NativeSyntheticEvent,
  StyleSheet,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import BorderLineImg from '../../../../assets/images/thread/border_line.svg';
import {MyTheme} from '../../../../theme';
import {Thread} from '../../types';
import BottomSection from './BottomSection';
import MediaBox from './MediaBox';

type ThreadItemProps = {
  thread: Thread;
  textInputRef?: RefObject<TextInput>;
  active: boolean;
  maxLength: number;
  onChangeText: (text: string) => void;
  onKeyPress?: (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => void;
  onFocus: () => void;
  onAddMediaPress: () => void;
  onCancelMediaPress: (index: number) => void;
};

function ThreadItem({
  thread,
  active,
  textInputRef = undefined,
  maxLength,
  onChangeText,
  onKeyPress,
  onFocus,
  onAddMediaPress,
  onCancelMediaPress,
}: ThreadItemProps) {
  const imagesHtml = thread.images
    ?.filter(el => el !== undefined && el !== null)
    .map((image, i) => (
      <MediaBox
        key={image + '_' + i}
        uri={image}
        onCancelPress={() => {
          onCancelMediaPress(i);
        }}
      />
    ));

  return (
    <View style={styles.root}>
      <View style={{alignItems: 'flex-end'}}>
        <BorderLineImg
          color={active ? MyTheme.primaryColor : MyTheme.grey300}
        />
        <LinearGradient
          style={styles.border}
          colors={
            active
              ? [MyTheme.primaryGradientFirst, MyTheme.primaryGradientSecond]
              : [MyTheme.grey300, MyTheme.grey300]
          }
        />
      </View>
      <View style={styles.contentCtn}>
        <TextInput
          ref={textInputRef}
          onFocus={onFocus}
          placeholderTextColor={MyTheme.grey200}
          multiline
          placeholder="Write something interesting"
          defaultValue={thread.body}
          value={thread.body}
          onChangeText={onChangeText}
          style={styles.inputField}
          maxLength={maxLength}
          onKeyPress={e => {
            onKeyPress && onKeyPress(e);
          }}
        />
        <BottomSection
          characterCount={thread.body.length}
          maxCharacters={maxLength}
          maxMedia={2}
          mediaCount={thread.images?.length || 0}
          onAddMediaPress={onAddMediaPress}
        />
        {thread.images && thread.images.length > 0 && (
          <View style={styles.imagesCtn}>{imagesHtml}</View>
        )}

        {thread.video && (
          <MediaBox
            isVideo
            uri={thread.video}
            onCancelPress={() => {
              onCancelMediaPress(0);
            }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    left: -10,
  },
  border: {
    width: 2,
    flex: 1,
  },
  contentCtn: {
    backgroundColor: MyTheme.white,
    width: '100%',
    padding: 15,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  counter: {
    fontSize: 12,
    color: 'gray',
  },
  inputField: {
    fontSize: 16,
    paddingVertical: 10,
  },
  imagesCtn: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 20,
  },
});

export default ThreadItem;
