import sys
import pandas as pd
from ProductRecommender import ProductRecommender
import os

# Lấy thư mục chứa script Recommend.py
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
data_path = os.path.join(BASE_DIR, 'data', 'interaction_scores.xlsx')
user_id = sys.argv[1]  # Nhận user_id từ Node.js
k = int(sys.argv[2])   # Nhận k từ Node.js
page = int(sys.argv[3])
# Đọc file interaction
interaction_scores = pd.read_excel(data_path)
productIds = interaction_scores[interaction_scores['userId'] == user_id]['productId'].values

product_path = os.path.join(BASE_DIR, 'data', 'products_nomalized.xlsx')
# Tạo recommender và gọi hàm
recommender = ProductRecommender(product_path)
recommended_products = recommender.recommend_products(productIds, k,page)

# In kết quả ra để Node.js đọc được
print(recommended_products)