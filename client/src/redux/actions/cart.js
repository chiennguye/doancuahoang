export const addToCart = (itemData) => {
    return  {
        type: 'ADD_TO_CART',
        payload: {
            quantity: itemData.quantity,
            productId: itemData.productId,
            name: itemData.name,
            imageUrl: itemData.imageUrl,
            slug: itemData.slug,
            price: itemData.price,
            totalPriceItem: itemData.totalPriceItem,
            product: {
                _id: itemData.product._id,
                name: itemData.product.name,
                imageUrl: itemData.product.imageUrl,
                slug: itemData.product.slug,
                price: itemData.product.price,
                quantity: itemData.product.quantity // This is the available stock quantity
            }
        }
    }
}

export const updateQuantity = (data) => {
    return  {
        type: 'UPDATE_QUANTITY',
        payload: data
    }
}

export const removeItem = (data) => {
    return  {
        type: 'REMOVE_ITEM',
        payload: data
    }
}

export const setCart = (data) => {
    return {
        type: "SET_CART",
        payload: data
    }
}

export const updateVoucher = (data) => {
    return  {
        type: 'UPDATE_VOUCHER',
        payload: data
    }
}

export const destroy = () => {
    return  {
        type: 'DESTROY',
    }
}





