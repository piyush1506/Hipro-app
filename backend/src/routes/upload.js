const express = require('express');
const router =  express.Router();

const multer = require('multer');
const {uploadToImageKit,GetAuthenticationParameters} = require('../services/imagekit');
// const { data } = require('autoprefixer');

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits:{fileSize:10*1024*1024}
});


router.post('/',upload.single('file'),async (req,res)=>{
    try{
        if (!req.file) {
            return res.status(400).json({
                success:false,
                message:'No image file provided'
            });
        }
        const folder = req.body.folder || '/inspections';
        const fileName = req.file.originalname || `image_${Date.now()}.jpg`;
        const result = await uploadToImageKit(req.file.buffer,fileName,folder);
        res.json({
            success:true,
            message:'image uploaded successfully ',
            data:result
        })
    }
    catch(error){
       console.error('ImageKit Upload Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload image to ImageKit'
    });   
}   
})

router.get('/auth', (req, res) => {
    try {
        const authparams = GetAuthenticationParameters();
        res.json({
            success: true,
            data: authparams
        });
    } catch (error) {
        console.error('ImageKit Auth Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get authentication parameters from ImageKit'
        });   
    }
});

module.exports = router;