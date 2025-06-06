import React from "react";
import { FaTimes } from "react-icons/fa";
import format from "../../../helper/format";
import styles from "./PayItem.module.css";

const PayItem = ({ item, quantity, totalPriceItem }) => {
  return (
    <div className={styles.payItemContainer}>
      <div className={styles.productInfo}>
        <div className={styles.productImage}>
          <img
            src={item.imageUrl || "/images/default-book.jpg"}
            alt={item.name}
            onError={(e) => {
              e.target.src = "/images/default-book.jpg";
            }}
          />
        </div>
        <div className={styles.productDetails}>
          <h6 className={styles.productName}>{item.name}</h6>
          <div className={styles.priceInfo}>
            <span className={styles.unitPrice}>
              {format.formatPrice(item.price)}
            </span>
            <FaTimes className={styles.multiplyIcon} />
            <span className={styles.quantity}>{quantity}</span>
          </div>
        </div>
      </div>
      <div className={styles.totalPrice}>
        {format.formatPrice(totalPriceItem)}
      </div>
    </div>
  );
};
export default PayItem;
