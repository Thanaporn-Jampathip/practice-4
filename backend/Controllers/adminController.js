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
            SELECT id FROM evaluation WHERE id = ?
            `, [evaluationId])

        if (evaluation.length === 0) {
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

// indicator
exports.addIndicator = async (req, res) => {
    try {
        const { title, description, topicId, evidenceDescription, IndicatorType, weight } = req.body

        if (!title || !description || !topicId || !evidenceDescription || !IndicatorType || !weight) {
            return res.status(400).json({
                success: false,
                message: "กรอกให้ครบ"
            })
        }

        const [topics] = await mysqli.query(`
            SELECT id FROM EvaluationTopic WHERE id = ?
            `, [topicId])

        if (topics.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'ไม่มีหัวข้อการประเมินนี้'
            })
        }

        const [result] = await mysqli.query(`
            INSERT INTO Indicator (title, description, topicId, evidenceDescription, IndicatorType, weight)
            VALUES (?,?,?,?,?,?)
            `, [title, description, topicId, evidenceDescription, IndicatorType, weight])

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
exports.getIndicator = async (req, res) => {
    try {
        const [indicators] = await mysqli.query(`
            SELECT i.*, t.id
            FROM Indicator i
            JOIN EvaluationTopic t ON i.topicId = t.id
            `)

        res.json({
            success: true,
            data: {
                indicators
            }
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error
        })
    }
}
exports.updateIndicator = async (req, res) => {
    try {
        const { id } = req.params
        const { title, description, topicId, evidenceDescription, IndicatorType, weight } = req.body

        await mysqli.query(`
            UPDATE Indicator SET title = ?, description = ? , topicId = ?,evidenceDescription = ?,IndicatorType = ? , weight = ?  WHERE id = ?
            `, [title, description, topicId, evidenceDescription, IndicatorType, weight, id])

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
exports.deleteIndicator = async (req, res) => {
    try {
        const { id } = req.params
        await mysqli.query(`
        DELETE FROM Indicator WHERE id = ?
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

// allocation
exports.addAllocation = async (req, res) => {
    try {
        const { evaluationId, evaluateeId, evaluatorId, evaluationComment, evaluatorRole, status, signatureData, signatureDate, submittedAt } = req.body

        if (!evaluationId || !evaluateeId || !evaluatorId) {
            return res.status(400).json({
                success: false,
                message: "กรอกให้ครบ"
            })
        }

        const [result] = await mysqli.query(`
            INSERT INTO EvaluationAllocation (evaluationId, evaluateeId, evaluatorId, evaluationComment, evaluatorRole, status, signatureData, signatureDate, submittedAt)
            VALUES (?,?,?,?,?,?,?,?,?)
            `, [evaluationId, evaluateeId, evaluatorId, evaluationComment || null, evaluatorRole || null, status, signatureData, signatureDate, submittedAt])

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
exports.getAllocation = async (req, res) => {
    try {
        const [indicators] = await mysqli.query(`
            SELECT ea.*, e.id as evaluationId, evaluatee.name  as evaluateeName, evaluator.name as evaluatorName
            FROM EvaluationAllocation ea
            JOIN Evaluation e ON ea.evaluationId = e.id
            JOIN Employee evaluatee ON ea.evaluateeId = evaluatee.id
            JOIN Employee evaluator ON ea.evaluatorId = evaluator.id
            `)

        res.json({
            success: true,
            data: {
                indicators
            }
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error
        })
    }
}