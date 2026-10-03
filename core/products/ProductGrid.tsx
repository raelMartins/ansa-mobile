import { View } from "react-native";
import { bentoLayout } from "./bento";
import { ANSA_PRODUCTS, type AnsaProduct, type AnsaProductId } from "./catalog";
import { ProductTile } from "./ProductTile";

type Props = {
  width: number;
  visible: boolean;
  onSelect: (product: AnsaProduct) => void;
  products?: AnsaProduct[];
  selectedId?: AnsaProductId | null;
  compact?: boolean;
  reduceMotion?: boolean;
};

export function ProductGrid({
  width,
  visible,
  onSelect,
  products = ANSA_PRODUCTS,
  selectedId,
  compact,
  reduceMotion,
}: Props) {
  const { cells, height } = bentoLayout(products, width, compact);
  const order = new Map(products.map((p, i) => [p.id, i]));

  return (
    <View style={{ width, height }}>
      {cells.map((cell) => (
        <View
          key={cell.product.id}
          style={{ position: "absolute", left: cell.x, top: cell.y, width: cell.w, height: cell.h }}
        >
          <ProductTile
            product={cell.product}
            kind={cell.kind}
            width={cell.w}
            height={cell.h}
            index={order.get(cell.product.id) ?? 0}
            visible={visible}
            selected={selectedId === cell.product.id}
            reduceMotion={reduceMotion}
            onSelect={onSelect}
          />
        </View>
      ))}
    </View>
  );
}
