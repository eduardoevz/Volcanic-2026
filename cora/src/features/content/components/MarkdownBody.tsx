import { StyleSheet, View } from 'react-native';

import { parseMarkdown, type InlineSegment } from '@/features/content/markdown';
import { Text } from '@/ui/components/Text';
import { spacing } from '@/ui/theme/tokens';

function Inline({ segments }: { segments: InlineSegment[] }) {
  return (
    <Text variant="body">
      {segments.map((s, i) => (s.bold ? <Text key={i} variant="body" style={styles.bold}>{s.text}</Text> : s.text))}
    </Text>
  );
}

export function MarkdownBody({ markdown }: { markdown: string }) {
  const blocks = parseMarkdown(markdown);

  return (
    <View style={styles.container}>
      {blocks.map((block, i) => {
        if (block.type === 'heading') {
          return (
            <Text key={i} variant="heading" style={styles.heading}>
              {block.text}
            </Text>
          );
        }
        if (block.type === 'list') {
          return (
            <View key={i} style={styles.list}>
              {block.items.map((segments, j) => (
                <View key={j} style={styles.listRow}>
                  <Text variant="body">{'•'}</Text>
                  <View style={styles.listItemText}>
                    <Inline segments={segments} />
                  </View>
                </View>
              ))}
            </View>
          );
        }
        return <Inline key={i} segments={block.segments} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  heading: {
    marginTop: spacing.xs,
  },
  bold: {
    fontWeight: '700',
  },
  list: {
    gap: spacing.xs,
  },
  listRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  listItemText: {
    flex: 1,
  },
});
