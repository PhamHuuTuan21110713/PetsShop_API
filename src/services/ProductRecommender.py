import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
import math
import json
class ProductRecommender:
    def __init__(self, products_file):
        # Đọc dữ liệu sản phẩm
        self.products = pd.read_excel(products_file)
        # Tạo dữ liệu nhị phân (one-hot encoding) cho loại sản phẩm
        self.products_binary = pd.get_dummies(self.products.set_index('_id')['type_id']).groupby(level=0).max()
        # Tính toán độ tương đồng cosine giữa các sản phẩm
        self.content_sim = cosine_similarity(self.products_binary)
        # Chuyển đổi kết quả tương đồng thành DataFrame
        self.content_sim_df = pd.DataFrame(self.content_sim, index=self.products_binary.index, columns=self.products_binary.index)

    def recommend_products(self, product_ids, k = 5, page=1):
        """
        Đưa ra gợi ý sản phẩm dựa trên độ tương đồng nội dung.
        
        :param product_ids: Danh sách các ID sản phẩm đã tương tác.
        :param k: Số lượng sản phẩm được gợi ý.
        :return: Top k sản phẩm gợi ý.
        """
        scores = pd.Series(dtype=float)
        
        # Cộng dồn điểm tương đồng từ các sản phẩm đã chọn
        for product in product_ids:
            if product in self.content_sim_df.index:
                scores = scores.add(self.content_sim_df[product], fill_value=0)
        
        # Bỏ các sản phẩm đã tương tác
        scores = scores.drop(labels=product_ids, errors='ignore')
        start = (page - 1) * k
        end = start + k
        total = len(scores)
        # Sắp xếp và lấy top k sản phẩm có điểm tương đồng cao nhất
        # recommended = scores.sort_values(ascending=False).head(k)
        recommended =  scores.sort_values(ascending=False).iloc[start:end]
        recommended_ids = recommended.index.tolist()
        # Trả về danh sách sản phẩm gợi ý
        total_pages = math.ceil(total / k)
        return json.dumps({
            "page": page,
            "total": total,
            "total_pages": total_pages,
            "data": recommended_ids
})