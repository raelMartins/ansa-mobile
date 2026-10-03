import * as ImagePicker from "expo-image-picker";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { feedback } from "../../../core/feedback/feedback";
import { useTheme } from "../../../core/ui/ThemeContext";
import { useThemedStyles } from "../../../core/ui/themedStyles";
import { resolveMediaUrl } from "../../lib/resolveMediaUrl";
import { merchantRadii } from "../../ui/merchantUi";

const THUMB_SIZE = 88;
const ROW_HEIGHT = 100;
const EMPTY_SLOT_HEIGHT = 152;

type LocalPhoto = { uri: string; uploading?: boolean };

type Props = {
  photos: LocalPhoto[];
  maxPhotos: number;
  onAdd: (dataUrl: string, previewUri: string) => Promise<void>;
  onRemove: (index: number) => void;
};

function IconCamera({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M5 8h2l1.2-2h7.6L17 8h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2z"
        stroke={color}
        strokeWidth={1.7}
        fill="none"
        strokeLinejoin="round"
      />
      <Path
        d="M12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"
        stroke={color}
        strokeWidth={1.7}
        fill="none"
      />
    </Svg>
  );
}

export function ProductPhotoPicker({ photos, maxPhotos, onAdd, onRemove }: Props) {
  const { colors, fonts } = useTheme();
  const styles = useThemedStyles((c, f) => ({
    header: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 12 },
    title: { fontSize: 16, fontFamily: f.semiBold, color: c.text },
    headerLink: { fontSize: 15, fontFamily: f.semiBold, color: c.accent },
    hint: { fontSize: 13, fontFamily: f.regular, color: c.textMuted, lineHeight: 18, marginTop: 10 },
    thumb: {
      width: THUMB_SIZE,
      height: ROW_HEIGHT,
      borderRadius: merchantRadii.button,
      overflow: "hidden",
      backgroundColor: "rgba(212, 220, 213, 0.35)",
    },
    addSlot: {
      borderRadius: merchantRadii.button,
      borderWidth: 1.5,
      borderStyle: "dashed",
      borderColor: c.border,
      backgroundColor: c.bg,
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingHorizontal: 12,
    },
    addLabel: { fontSize: 14, fontFamily: f.semiBold, color: c.text },
    row: { flexDirection: "row", alignItems: "stretch", gap: 10 },
    scrollRow: { flexDirection: "row", alignItems: "stretch", gap: 10, paddingRight: 4 },
  }));

  const pick = async () => {
    if (photos.length >= maxPhotos) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.82,
      base64: true,
      allowsMultipleSelection: false,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    const mime = asset.mimeType ?? "image/jpeg";
    if (!asset.base64) return;
    const dataUrl = `data:${mime};base64,${asset.base64}`;
    feedback.tap();
    await onAdd(dataUrl, asset.uri);
  };

  const canAdd = photos.length < maxPhotos;

  const addSlot = (style: object) => (
    <Pressable
      style={[styles.addSlot, style]}
      onPress={() => void pick()}
      accessibilityRole="button"
      accessibilityLabel="Add photo"
    >
      <IconCamera color={colors.text} size={26} />
      <Text style={styles.addLabel}>Add photo</Text>
    </Pressable>
  );

  const thumb = (p: LocalPhoto, index: number) => (
    <Pressable
      key={`${p.uri}-${index}`}
      style={styles.thumb}
      onLongPress={() => onRemove(index)}
      accessibilityLabel={`Product photo ${index + 1}. Long press to remove.`}
    >
      <Image source={{ uri: resolveMediaUrl(p.uri) ?? p.uri }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
      {p.uploading ? (
        <View
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.35)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 11, fontFamily: fonts.medium }}>Uploading…</Text>
        </View>
      ) : null}
    </Pressable>
  );

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>Product photos</Text>
        {canAdd ? (
          <Pressable onPress={() => void pick()} hitSlop={8} accessibilityRole="button">
            <Text style={styles.headerLink}>Add photo →</Text>
          </Pressable>
        ) : null}
      </View>

      {photos.length === 0 && canAdd ? addSlot({ width: "100%", height: EMPTY_SLOT_HEIGHT }) : null}

      {photos.length > 0 ? (
        photos.length >= 3 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.scrollRow}>
              {photos.map(thumb)}
              {canAdd ? addSlot({ width: 168, height: ROW_HEIGHT }) : null}
            </View>
          </ScrollView>
        ) : (
          <View style={styles.row}>
            {photos.map(thumb)}
            {canAdd ? addSlot({ flex: 1, minWidth: 120, height: ROW_HEIGHT }) : null}
          </View>
        )
      ) : null}

      <Text style={styles.hint}>
        {photos.length} of {maxPhotos} photos · JPG or PNG, up to 5 MB each
      </Text>
    </View>
  );
}
