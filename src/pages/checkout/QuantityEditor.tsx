interface QuantityEditorProps {
  quantity: number;
  isEditing: boolean;
  editQuantity: number;
  buyNowMode: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onQuantityChange: (quantity: number) => void;
  onDelete?: () => void;
}

export function QuantityEditor({
  quantity,
  isEditing,
  editQuantity,
  buyNowMode,
  onEdit,
  onSave,
  onCancel,
  onQuantityChange,
  onDelete,
}: QuantityEditorProps) {
  if (isEditing && buyNowMode) {
    return (
      <div className="quantity-edit-container">
        <span>Quantity: </span>
        <select
          value={editQuantity}
          onChange={(e) => onQuantityChange(Number(e.target.value))}
          className="quantity-selector-small"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
        <button className="btn-save" onClick={onSave}>
          保存
        </button>
        <button className="btn-cancel" onClick={onCancel}>
          取消
        </button>
      </div>
    );
  }

  return (
    <>
      <span>
        Quantity: <span className="quantity-label">{quantity}</span>
      </span>

      {buyNowMode ? (
        <button className="btn-update" onClick={onEdit}>
          修改
        </button>
      ) : (
        <>
          <span className="update-quantity-link link-primary">Update</span>
          <span
            className="delete-quantity-link link-primary"
            onClick={onDelete}
          >
            Delete
          </span>
        </>
      )}
    </>
  );
}
