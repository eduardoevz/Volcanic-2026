import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';

import { MessageBubble, ReferralCard, SourceChips, SUGGESTED_QUESTIONS, useChat } from '@/features/assistant';
import { useProfile } from '@/features/profile';
import { Banner } from '@/ui/components/Banner';
import { Button } from '@/ui/components/Button';
import { Card } from '@/ui/components/Card';
import { Input } from '@/ui/components/Input';
import { Screen } from '@/ui/components/Screen';
import { Text } from '@/ui/components/Text';
import { spacing } from '@/ui/theme/tokens';

export default function Assistant() {
  const { t } = useTranslation('assistant');
  const { data: profile } = useProfile();
  const { messages, send, isSending, errorMessage, isOnline } = useChat();
  const [input, setInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const suggestions = profile?.life_stage ? SUGGESTED_QUESTIONS[profile.life_stage] : [];

  const handleSend = (text: string) => {
    setInput('');
    send(text);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  };

  return (
    <Screen>
      <Text variant="title" style={{ marginBottom: spacing.sm }}>
        {t('title')}
      </Text>
      <Banner message={t('disclaimer')} tone="info" />

      <KeyboardAvoidingView
        style={{ flex: 1, marginTop: spacing.sm }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.md }}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          <MessageBubble message={{ id: 'first', role: 'assistant', content: t('firstMessage') }} />

          {messages.map((message) => (
            <View key={message.id} style={{ gap: spacing.xs }}>
              {message.role === 'referral' ? (
                <ReferralCard text={message.content} />
              ) : (
                <MessageBubble message={message} />
              )}
              {message.citedContentIds && message.citedContentIds.length > 0 ? (
                <SourceChips contentIds={message.citedContentIds} />
              ) : null}
            </View>
          ))}

          {errorMessage ? <Banner message={errorMessage} tone="danger" /> : null}

          {!isOnline ? <Banner message={t('offline')} tone="warning" /> : null}
        </ScrollView>

        {messages.length === 0 && suggestions.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.sm }}>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              {suggestions.map((question) => (
                <Pressable key={question} onPress={() => handleSend(question)} style={{ width: 180 }}>
                  <Card>
                    <Text variant="caption">{question}</Text>
                  </Card>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        ) : null}

        <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-end' }}>
          <View style={{ flex: 1 }}>
            <Input
              placeholder={t('inputPlaceholder')}
              value={input}
              onChangeText={setInput}
              editable={isOnline && !isSending}
              multiline
            />
          </View>
          <Button
            label={t('send')}
            onPress={() => handleSend(input)}
            disabled={!isOnline || isSending || input.trim().length === 0}
            loading={isSending}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
