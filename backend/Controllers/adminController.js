const {mysqli} = require('../db/connect')

exports.addEvaluation = async (req, res)=>{
    try{
        const {period, evaluationYear, startDate, endDate} = req.body

        const [result] = await mysqli.query(`
            INSERT INTO Evaluation (period, evaluationYear, startDate, endDate)
            VALUES (?,?,?,?)
            `,[period, evaluationYear, startDate, endDate])

        res.json({
            success: true,
            message: 'เพิ่มข้อมูลสำเร็จ',
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
exports.getEvaluation = async (req, res)=>{
    try{
        const [evaluations] = await mysqli.query(`
            SELECT * FROM Evaluation ORDER BY evaluationYear DESC, period DESC
            `)

        res.json({
            success: true,
            data:{
                evaluations
            }
        })
    }catch(error){
        return res.status(500).json({
            success: false,
            message: error
        })
    }
}
exports.updateEvaluation = async (req, res)=>{
    try{
        const {id} = req.params
        const {period, evaluationYear, startDate, endDate} = req.body

        await mysqli.query(`
            UPDATE Evaluation SET period = ?,evaluationYear = ?,startDate = ?,endDate = ? WHERE id = ?
            `,[period, evaluationYear, startDate, endDate,id])

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