import { useState } from 'react';
import { router } from 'expo-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Share, View } from 'react-native';

import { useCreateInvite, inviteSchema, type InviteInput } from '@/features/family';
import { useProfile } from '@/features/profile';
import { useSession } from '@/shared/hooks/useSession';
import { Banner } from '@/ui/components/Banner';
import { Button } from '@/ui/components/Button';
import { Input } from '@/ui/components/Input';
import { Screen } from '@/ui/components/Screen';
import { Text } from '@/ui/components/Text';
import { spacing } from '@/ui/theme/tokens';

export default function FamilyInvite() {
  const { t } = useTranslation('family');
  const { session } = useSession();
  const { data: profile } = useProfile();
  const createInvite = useCreateInvite();
  const [formError, setFormError] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InviteInput>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { inviteEmail: '', relationship: '' },
  });

  const onSubmit = async (values: InviteInput) => {
    setFormError(null);
    if (!session?.user.id) return;
    try {
      const row = await createInvite.mutateAsync({
        ownerId: session.user.id,
        ownerDisplayName: profile?.display_name ?? t('defaultOwnerName'),
        inviteEmail: values.inviteEmail,
        relationship: values.relationship,
      });
      setShareLink(`cora://family/accept?membershipId=${row.id}`);
    } catch {
      setFormError(t('inviteError'));
    }
  };

  const handleShare = () => {
    if (!shareLink) return;
    Share.share({ message: t('shareMessage', { link: shareLink }) });
  };

  return (
    <Screen>
      <Text variant="title" style={{ marginBottom: spacing.lg }}>
        {t('inviteTitle')}
      </Text>

      {shareLink ? (
        <View style={{ gap: spacing.sm }}>
          <Banner tone="info" message={t('inviteSuccess')} />
          <Button label={t('shareLinkButton')} onPress={handleShare} />
          <Button label={t('done')} variant="ghost" onPress={() => router.replace('/family')} />
        </View>
      ) : (
        <View style={{ gap: spacing.sm }}>
          {formError ? <Banner message={formError} tone="danger" /> : null}

          <Controller
            control={control}
            name="inviteEmail"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={t('emailLabel')}
                placeholder={t('emailPlaceholder')}
                autoCapitalize="none"
                keyboardType="email-address"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.inviteEmail?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="relationship"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={t('relationshipLabel')}
                placeholder={t('relationshipPlaceholder')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.relationship?.message}
              />
            )}
          />

          <Button
            label={t('inviteSubmit')}
            loading={isSubmitting}
            onPress={handleSubmit(onSubmit)}
            style={{ marginTop: spacing.xs }}
          />
        </View>
      )}
    </Screen>
  );
}
