const {mysqli} = require('../db/connect')
const jwt = require('jsonwebtoken')


exports.register = async (req ,res) =>{
    try{
        const {name, email, password, role, position, phoneNumber, departmentId} = req.body

        if(!name || !email || !password){
            return res.status(400).json({
                success: false,
                message: "กรอกให้ครบ"
            })
        }

        const [employee] = await mysqli.query(`SELECT * FROM Employee WHERE email = ?`,[email])

        if(employee.length > 0){
            return res.status(400).json({
                success: false,
                message: 'email is already exist'
            })
        }

        const [result] = await mysqli.query(`
            INSERT INTO Employee (name, email, password, role, position, phoneNumber, departmentId,isActive)
            VALUES (?,?,?,'employee',?,?,?,TRUE)
            `,[name, email, password, position || null, phoneNumber || null, departmentId])

        res.json({
            success: true,
            message: 'สมัครสำเร็จ',
            data:{
                id: result.insertId
            }
        })
    }catch(error){
        return res.status(500).json({
            success: false,
            message: error
        })
    }
}
exports.login = async (req ,res) =>{
    try{
        const {email, password} = req.body

        if(!email || !password){
            return res.status(400).json({
                success: false,
                message: 'กรอกให้ครบ'
            })
        }

        const [employees] = await mysqli.query(
            `SELECT * FROM Employee WHERE email = ? AND isActive = TRUE`,[email]
        )

        if(employees.length === 0){
            return res.status(404).json({
                success: false,
                message: 'not found this employee'
            })
        }

        const employee = employees[0]

        if(password !== employee.password){
            return res.status(401).json({
                success: false,
                message: 'email or password is not match'
            })
        }

        const token = jwt.sign({
            id: employee.id,
            name: employee.name,
            email: employee.email,
            role: employee.role
        },
        process.env.JWT_SECRET,
        {expiresIn: process.env.JWT_EXPIRES_IN}
        )

        res.json({
            success: true,
            message: 'เข้าได้แล้วนะ',
            data:{
                token,
                user:{
                    id: employee.id,
                    name: employee.name,
                    email: employee.email,
                    role: employee.role,
                    position: employee.position,
                    phoneNumber: employee.phoneNumber,
                    departmentId: employee.departmentId,
                    isActive: employee.isActive
                }
            }
        })
    }catch(error){
        return res.status(500).json({
            success: false,
            message: 'Server Error'
        })
    }
}
exports.getme = async (req ,res) =>{
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