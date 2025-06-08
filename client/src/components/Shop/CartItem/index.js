import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateQuantity, removeItem } from "../../../redux/actions/cart";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import { FaTrashAlt, FaPlus, FaMinus } from "react-icons/fa";
import { AiOutlineHeart, AiOutlineEdit } from "react-icons/ai";

import format from "../../../helper/format";
import styles from "./CartItem.module.css";
import { Button } from "react-bootstrap";

export default function CartItem(props) {
  const dispatch = useDispatch();
  const maxQuantity = props.product?.quantity || 0;

  const [quantity, setQuantity] = useState(props.quantity);
  const [totalPriceItem, setTotalPriceItem] = useState(props.totalPriceItem);

  function increaseQuantity() {
    if (quantity >= maxQuantity) {
      toast.error(`Chỉ còn ${maxQuantity} cuốn trong kho!`, {
        autoClose: 2000,
      });
      return;
    }
    setQuantity((preValue) => preValue + 1);
    setTotalPriceItem(props.price * (quantity + 1));
  }

  function decreaseQuantity() {
    if (quantity > 1) {
      setQuantity((preValue) => preValue - 1);
      setTotalPriceItem(props.price * (quantity - 1));
    }
  }

  function handleChange(event) {
    const value = parseInt(event.target.value);
    if (value > maxQuantity) {
      toast.error(`Chỉ còn ${maxQuantity} cuốn trong kho!`, {
        autoClose: 2000,
      });
      setQuantity(maxQuantity);
      setTotalPriceItem(props.price * maxQuantity);
      return;
    }
    if (value > 0) {
      setQuantity(value);
      setTotalPriceItem(props.price * value);
    } else {
      setQuantity(1);
      setTotalPriceItem(props.price);
    }
  }

  const handleRemoveItem = (productId) => {
    dispatch(removeItem({ productId }));
  };

  useEffect(() => {
    dispatch(updateQuantity({ productId: props.productId, quantity }));
  }, [quantity, dispatch, props.productId]);

  return (
    <div className={styles.cartItem}>
      <div className={styles.productInfo}>
        <div className={styles.imageContainer}>
          <img
            src={props.imageUrl}
            alt={props.name}
            className={styles.productImage}
          />
        </div>
        <div className={styles.productDetails}>
          <h6 className={styles.productName}>{props.name}</h6>
          <div className={styles.productMeta}>
            <span className={styles.unitPrice}>
              Đơn giá: {format.formatPrice(props.price)}
            </span>
            {maxQuantity > 0 && (
              <span className={styles.stockInfo}>
                Còn lại: {maxQuantity} cuốn
              </span>
            )}
          </div>
        </div>
      </div>

      <div className={styles.quantitySection}>
        <label className={styles.quantityLabel}>Số lượng</label>
        <div className={styles.quantityControls}>
          <button
            className={styles.quantityBtn}
            onClick={decreaseQuantity}
            disabled={quantity <= 1}
          >
            <FaMinus />
          </button>
          <input
            type="number"
            className={styles.quantityInput}
            value={quantity}
            onChange={handleChange}
            min="1"
            max={maxQuantity}
          />
          <button 
            className={styles.quantityBtn} 
            onClick={increaseQuantity}
            disabled={quantity >= maxQuantity}
          >
            <FaPlus />
          </button>
          <Button variant="danger" onClick={() => handleRemoveItem(props.productId)}>
            <FaTrashAlt />
          </Button>
        </div>
      </div>

      <div className={styles.priceSection}>
        <div className={styles.totalPrice}>
          <span className={styles.priceLabel}>Thành tiền</span>
          <span className={styles.priceAmount}>
            {format.formatPrice(totalPriceItem)}
          </span>
        </div>
      </div>

      {/* <div className={styles.actionsSection}>
        <div className={styles.actionButtons}>
          <Button
            variant="outline-secondary"
            size="sm"
            className={styles.favoriteBtn}
            title="Yêu thích"
          >
            <AiOutlineHeart />
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleRemoveItem(props.productId)}
            className={styles.removeBtn}
            title="Xóa sản phẩm"
          >
            <FaTrashAlt />
          </Button>
        </div>
      </div> */}
    </div>
  );
}
