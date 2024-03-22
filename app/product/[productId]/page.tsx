import Container from "@/app/components/Container";
import { product } from "@/utils/product";
import ProductDetails from "./ProductDetails";

interface IParams {
    productId?: string;
}

//TODO: pass product that is matching to productId. (currently I just pass one product regardless of productId)
const Product = ({ params }: { params: IParams }) => {
    console.log('params', params);

    return <div className="p-8">
        <Container>
            <ProductDetails product={product} />
        </Container>
    </div>;
}

export default Product;