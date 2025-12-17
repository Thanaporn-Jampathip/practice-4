const jwt = require('jsonwebtoken')
require('dotenv').config()
const auth = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Login ก่อน'
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        next()
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Token หมดอายุหรือไม่ถูกต้อง'
        })
    }
}

const isAdmin = (req,res,next) =>{
    if(req.user.role !== 'admin'){
        return res.status(403).json({
            success: false ,
            message: 'admin only'
        })
    }
    next()
}
const isEvaluator = (req,res,next) =>{
    if(!['evaluator', 'admin'].includes(req.user.role)){
        return res.status(403).json({
            success: false ,
            message: 'admin only'
        })
    }
    next()
}
module.exports = {isAdmin, isEvaluator, auth}
