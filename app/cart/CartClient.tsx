"use client";

import { useCart } from "@/hooks/useCart";
import Link from "next/link";
import { MdArrowBack } from "react-icons/md";
import Heading from "../components/Heading";
import Button from "../components/Button";
import ItemContent from "./ItemContent";
import { formatPrice } from "@/utils/formatPrice";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const CartClient = () => {
  const { cartProducts, handleClearCart, cartTotalAmount } = useCart();
  const router = useRouter();

  async function handleProcessPayment() {
    cartProducts?.map((product) => {
      const data = {
        productId: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        image: product.selectedImage,
        quantity: product.quantity,
      };

      axios
        .post("/api/order", data)
        .then((item) => {
          console.log("item: ", item);
          toast.success("Items added to db");
        })
        .catch((error) => {
          console.log(error);
          toast.error("Failed to proceed, please login");
        })
        .finally();
    });

    handleClearCart();
    router.push(`/payment`);
  }

  if (!cartProducts || cartProducts.length === 0) {
    return (
      <div className="flex flex-col items-center">
        <div className="text-2xl">カートは空です</div>
        <div>
          <Link
            href={"/"}
            className="text-slate-500 flex items-center gap-1 mt-2"
          >
            <MdArrowBack />
            <span>商品を見てみる！</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Heading title="Shopping Cart" center />
      <div className="grid grid-cols-5 text-xs gap-4 pb-2 items-center mt-8">
        <div className="col-span-2 justify-self-start">PRODUCT</div>
        <div className="justify-self-center">PRICE</div>
        <div className="justify-self-center">QUANTITY</div>
        <div className="justify-self-end">TOTAL</div>
      </div>
      <div>
        {cartProducts &&
          cartProducts.map((item) => {
            return <ItemContent key={item.id} item={item} />;
          })}
      </div>
      <div className="border-t-[1.5px] border-slate-200 py-4 flex justify-between gap-4">
        <div className="w-[150px]">
          <Button
            label="カートを空にする"
            onClick={() => {
              handleClearCart();
            }}
            small
            outline
          />
        </div>
        <div className="text-sm flex flex-col gap-1 items-start">
          <div className="flex justify-between w-full text-base font-semibold">
            <span>小計</span>
            <span>{formatPrice(cartTotalAmount)}</span>
          </div>
          <p className="text-slate-500">
            税込み価格と送料はレジでご確認いただけます
          </p>
          <Button label="レジに進む" onClick={() => handleProcessPayment()} />
          <Link
            href={"/"}
            className="text-slate-500 flex items-center gap-1 mt-2"
          >
            <MdArrowBack />
            <span>他の商品も見てみる！</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartClient;
