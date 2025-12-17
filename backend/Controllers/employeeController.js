const {mysqli} = require('../db/connect')

exports.getProfile = async(req,res)=>{
    try{
        const userID = req.user.id

        const [employee] = await mysqli.query(`
            SELECT e.*, d.name as departmentName
            FROM Employee e
            JOIN Department d ON e.departmentId = d.id
            WHERE e.id = ?
            `,[userID])

        
        res.json({
            success: true,
            data:{
                employee
            }
        })
    }catch(error){
        return res.status(500).json({
            success: false,
            message: error
        })
    }
}
exports.updateProfile = async(req,res)=>{
    try{
        const {name, email, password, phoneNumber, departmentId} = req.body

        await mysqli.query(
            `UPDATE Employee SET name = ?,password = ?,email = ?,phoneNumber = ?, departmentId = ? WHERE id = ?`
        )
    }catch(error){
        return res.status(500).json({
            success: false,
            message: error
        })
    }
}

