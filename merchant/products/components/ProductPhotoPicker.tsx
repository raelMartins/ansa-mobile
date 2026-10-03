import * as ImagePicker from "expo-image-picker";
import { Image, Pressable, Text, View } from "react-native";
import { feedback } from "../../../core/feedback/feedback";
import { useThemedStyles } from "../../../core/ui/themedStyles";
import { resolveMediaUrl } from "../../lib/resolveMediaUrl";
import { merchantRadii } from "../../ui/merchantUi";

type LocalPhoto = { uri: string; uploading?: boolean; error?: string };

type Props = {
  photos: LocalPhoto[];
  maxPhotos: number;
  onAdd: (dataUrl: string, previewUri: string) => Promise<void>;
  onRemove: (index: number) => void;
};

export function ProductPhotoPicker({ photos, maxPhotos, onAdd, onRemove }: Props) {
  const styles = useThemedStyles((c, f) => ({
    row: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    tile: {
      width: 96,
      height: 96,
      borderRadius: merchantRadii.button,
      borderWidth: 1,
      borderColor: c.border,
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(212, 220, 213, 0.35)",
    },
    add: {
      borderStyle: "dashed",
    },
    addText: { fontSize: 13, fontFamily: f.semiBold, color: c.text },
    hint: { fontSize: 13, fontFamily: f.regular, color: c.textMuted, lineHeight: 18, marginTop: 8 },
    err: { fontSize: 11, fontFamily: f.medium, color: c.error, marginTop: 4 },
  }));

  const pick = async () => {
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

  return (
    <View>
      <View style={styles.row}>
        {photos.map((p, index) => (
          <Pressable key={`${p.uri}-${index}`} style={styles.tile} onLongPress={() => onRemove(index)}>
            <Image source={{ uri: resolveMediaUrl(p.uri) ?? p.uri }} style={{ width: "100%", height: "100%" }} />
            {p.uploading ? (
              <View style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#fff", fontSize: 11 }}>Uploading…</Text>
              </View>
            ) : null}
          </Pressable>
        ))}
        {photos.length < maxPhotos ? (
          <Pressable style={[styles.tile, styles.add]} onPress={() => void pick()} accessibilityRole="button">
            <Text style={styles.addText}>Add photo +</Text>
          </Pressable>
        ) : null}
      </View>
      <Text style={styles.hint}>Up to {maxPhotos} photos. JPG or PNG up to 5MB each.</Text>
    </View>
  );
}
