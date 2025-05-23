import fs from 'fs'
import XLSX from "xlsx"
import Preference from '../models/PreferenceModel.js';

const updateData = async () => {

    const users = await Preference.find({});

    const interactionScores = [];

    users.forEach(user => {
        const userId = user.userId;
        const prefers = user.prefres || [];
        const views = user.views || [];

        // const prefersMap = new Map(prefers.map(p => [p.productId, new Date(p.accessDate.$date)]));
        const prefersMap = new Map(prefers.map(p => [p.productId, new Date(p.accessDate)]));
        // const viewsMap = new Map(views.map(v => [v.productId, {
        //     numberAccess: v.numberAccess,
        //     accessDate: new Date(v.accessDate.$date)
        // }]));
        const viewsMap = new Map(views.map(v => [v.productId, {
            numberAccess: v.numberAccess,
            accessDate: new Date(v.accessDate)
        }]));

        const maxAccess = Math.max(...views.map(v => v.numberAccess), 1);

        const allProductIds = new Set([
            ...prefers.map(p => p.productId),
            ...views.map(v => v.productId)
        ]);

        allProductIds.forEach(productId => {
            const liked_score = prefersMap.has(productId) ? 1 : 0;
            const viewObj = viewsMap.get(productId);
            // const view_score = viewObj ? viewObj.numberAccess / maxAccess : 0;
            // Đảm bảo không chia cho 0 hoặc truy cập undefined
            let view_score = 0;
            if (viewObj && maxAccess > 0) {
                view_score = viewObj.numberAccess / maxAccess;
            }
            const score = 0.7 * liked_score + 0.3 * view_score;
            if (isNaN(score)) score = 0;
            const preferDate = prefersMap.get(productId);
            const viewDate = viewObj ? viewObj.accessDate : null;

            let latestTimestamp = null;
            if (preferDate && viewDate) {
                latestTimestamp = preferDate > viewDate ? preferDate : viewDate;
            } else if (preferDate) {
                latestTimestamp = preferDate;
            } else if (viewDate) {
                latestTimestamp = viewDate;
            }

            interactionScores.push({
                userId,
                productId,
                score: parseFloat(score.toFixed(4)),
                // timestamp: latestTimestamp ? latestTimestamp.toISOString() : null
                timestamp:
                    latestTimestamp instanceof Date && !isNaN(latestTimestamp)
                        ? latestTimestamp.toISOString()
                        : null
            });
        });
    });

    // Ghi ra file Excel
    const worksheet = XLSX.utils.json_to_sheet(interactionScores);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'InteractionScores');
    XLSX.writeFile(workbook, 'src/services/data/interaction_scores.xlsx');

    console.log('✅ Đã tạo file interaction_scores.xlsx');

}

export default updateData