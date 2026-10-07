const express = require('express');
const router = express.Router();
const prisma = require('../prisma');

router.get('/', async (req, res) => {
    try {
        const allServices = await prisma.service.findMany({
            include: {
                subServices: {
                    orderBy: { created_at: 'asc' }
                }
            },
            orderBy: { created_at: 'asc' }
        });
        res.json({
            success: true,
            message: "services fetched successfully",
            services: allServices,
            total: allServices.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "services fetched failed",
            error: error.message
        });
    }
});
module.exports = router;