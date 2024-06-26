"use client";

import { Product } from "@prisma/client";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { formatPrice } from "@/utils/formatPrice";
import Heading from "@/app/components/Heading";
import Status from "@/app/components/Status";
import {
  MdCached,
  MdClose,
  MdDelete,
  MdDone,
  MdRemoveRedEye,
} from "react-icons/md";
import ActionButton from "@/app/components/ActionButton";
import { useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { deleteObject, getStorage, ref } from "firebase/storage";
import firebaseApp from "@/libs/firebase";

interface ManageProductsClientProps {
  products: Product[];
}

const ManageProductsClient: React.FC<ManageProductsClientProps> = ({
  products,
}) => {
  const router = useRouter();
  const storage = getStorage(firebaseApp);
  let rows: any = [];

  if (products) {
    rows = products.map((product) => {
      return {
        id: product.id,
        name: product.name,
        color: product.image.color,
        price: formatPrice(product.price),
        category: product.category,
        inStock: product.inStock,
        image: product.image,
      };
    });
  }

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 220 },
    { field: "name", headerName: "商品名", width: 220 },
    {
      field: "color",
      headerName: "カラー",
      width: 100,
      renderCell: (params) => {
        return (
          <div className="flex justify-around items-center gap-3">
            <div> {params.row.color}</div>
            <div
              className="h-[20px] w-[20px] rounded-full"
              style={{ backgroundColor: params.row.image.colorCode }}
            ></div>
          </div>
        );
      },
    },
    {
      field: "price",
      headerName: "価格",
      width: 100,
      renderCell: (params) => {
        return (
          <div className="font-bold text-slate-800">{params.row.price}</div>
        );
      },
    },
    { field: "category", headerName: "カテゴリー", width: 100 },
    {
      field: "inStock",
      headerName: "在庫",
      width: 100,
      renderCell: (params) => {
        return (
          <div>
            {params.row.inStock === true ? (
              <Status
                text="有り"
                icon={MdDone}
                bg="bg-teal-100"
                color="text-teal-700"
              />
            ) : (
              <Status
                text="無し"
                icon={MdClose}
                bg="bg-rose-100"
                color="text-rose-700"
              />
            )}
          </div>
        );
      },
    },
    {
      field: "action",
      headerName: "操作",
      width: 200,
      renderCell: (params) => {
        return (
          <div className="flex justify-between gap-4 w-full pt-2">
            <ActionButton
              icon={MdCached}
              onClick={() => {
                handleToggleStock(params.row.id, params.row.inStock);
              }}
            />
            <ActionButton
              icon={MdDelete}
              onClick={() => {
                handleDelete(params.row.id, params.row.image);
              }}
            />
            <ActionButton
              icon={MdRemoveRedEye}
              onClick={() => {
                router.push(`/product/${params.row.id}`);
              }}
            />
          </div>
        );
      },
    },
  ];

  const handleToggleStock = useCallback((id: string, inStock: boolean) => {
    axios
      .put("/api/product", {
        id,
        inStock: !inStock,
      })
      .then((res) => {
        toast.success("在庫の有無を変更しました");
        router.refresh();
      })
      .catch((err) => {
        toast.error("エラーが発生しました");
        console.log(err);
      });
  }, []);

  const handleDelete = useCallback(async (id: string, image: any) => {
    toast("商品を削除しています。少々お待ちください...");

    const handleImageDelete = async () => {
      try {
        const imageRef = ref(storage, image.imageUrl);
        await deleteObject(imageRef);
        console.log("image deleted", image.imageUrl);
      } catch (error) {
        return console.log("Deleting images error", error);
      }
    };

    await handleImageDelete();

    axios
      .delete(`/api/product/${id}`)
      .then((res) => {
        toast.success("商品が削除されました");
        router.refresh();
      })
      .catch((err) => {
        toast.error("エラーが発生しました");
        console.log(err);
      });
  }, []);

  return (
    <div className="max-w-[1150px] m-auto text-xl">
      <div className="mb-4 mt-8">
        <Heading title="商品を管理する" center />
      </div>
      <div style={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[5, 10, 25]}
          checkboxSelection
          disableRowSelectionOnClick
        />
      </div>
    </div>
  );
};

export default ManageProductsClient;
