const { mysqli } = require('../db/connect')
//evaluation
exports.addEvaluation = async (req, res) => {
    try {
        const { period, evaluationYear, startDate, endDate } = req.body

        if (!period || !evaluationYear || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: "กรอกให้ครบ"
            })
        }

        const [result] = await mysqli.query(`
            INSERT INTO Evaluation (period, evaluationYear, startDate, endDate)
            VALUES (?,?,?,?)
            `, [period, evaluationYear, startDate, endDate])

        res.json({
            success: true,
            message: 'เพิ่มข้อมูลสำเร็จ',
            data: {
                id: result.insertId
            }
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error
        })
    }
}
exports.getEvaluation = async (req, res) => {
    try {
        const [evaluations] = await mysqli.query(`
            SELECT * FROM Evaluation ORDER BY evaluationYear DESC, period DESC
            `)

        res.json({
            success: true,
            data: {
                evaluations
            }
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error
        })
    }
}
exports.updateEvaluation = async (req, res) => {
    try {
        const { id } = req.params
        const { period, evaluationYear, startDate, endDate } = req.body

        await mysqli.query(`
            UPDATE Evaluation SET period = ?,evaluationYear = ?,startDate = ?,endDate = ? WHERE id = ?
            `, [period, evaluationYear, startDate, endDate, id])

        res.json({
            success: true,
            message: 'แก้ไขสำเร็จ'
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error
        })
    }
}

//topics
exports.addTopics = async (req, res) => {
    try {
        const { title, description, evaluationId } = req.body

        if (!title || !description || !evaluationId) {
            return res.status(400).json({
                success: false,
                message: "กรอกให้ครบ"
            })
        }

        const [evaluation] = await mysqli.query(`
            SELECT id FROM EvaluationTopic WHERE id = ?
            `, [evaluationId])

        if (evaluation.length > 0) {
            return res.status(404).json({
                success: false,
                message: 'ไม่มีการประเมินนี้'
            })
        }

        const [result] = await mysqli.query(`
            INSERT INTO EvaluationTopic (title, description, evaluationId)
            VALUES (?,?,?)
            `, [title, description, evaluationId])

        res.json({
            success: true,
            message: 'เพิ่มข้อมูลสำเร็จ',
            data: {
                id: result.insertId
            }
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error
        })
    }
}
exports.getTopics = async (req, res) => {
    try {
        const [topics] = await mysqli.query(`
            SELECT t.*, e.id
            FROM EvaluationTopic t
            JOIN Evaluation e ON t.evaluationId = e.id
            `)

        res.json({
            success: true,
            data: {
                topics
            }
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error
        })
    }
}
exports.updateTopics = async (req, res) => {
    try {
        const { id } = req.params
        const { title, description, evaluationId } = req.body

        await mysqli.query(`
            UPDATE EvaluationTopic SET title = ?, description = ? , evaluationId = ? WHERE id = ?
            `, [title, description, evaluationId, id])

        res.json({
            success: true,
            message: 'แก้ไขสำเร็จ'
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error
        })
    }
}
exports.deleteTopics = async (req, res) => {
    try {
        const { id } = req.params
        await mysqli.query(`
        DELETE FROM EvaluationTopic WHERE id = ?
        `, [id])

        res.json({
            success: true,
            message: 'ลบหัวข้อประเมินสำเร็จ'
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error
        })
    }
}

