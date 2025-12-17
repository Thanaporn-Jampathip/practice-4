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
        const userID = req.user.id
        const {name, email, password,position, phoneNumber, departmentId} = req.body

        await mysqli.query(
            `UPDATE Employee SET name = ?, email = ?, password = ?, position = ?,phoneNumber = ?, departmentId = ? WHERE id = ?`,[name, email, password, position || null, phoneNumber || null, departmentId,userID]
        )

        res.json({
            success: true,
            message: 'แก้ไขสำเร็จ'
        })
    }catch(error){
        return res.status(500).json({
            success: false,
            message: error
        })
    }
}

