'use strict';
import UserSkill from './userSkill.model.js';

// WORKER: Agregar UserSkill 
export const addUserSkill = async (req, res) => {
    try {
        const data = req.body;
        data.userId = req.user._id;
        const userSkill = new UserSkill(data);
        await userSkill.save();
        res.status(201).json({ success: true, data: userSkill });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// WORKER: Editar UserSkill 
export const updateUserSkill = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await UserSkill.findOneAndUpdate({ _id: id, userId: req.user._id }, req.body, { new: true });
        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// WORKER: Ver sus propias habilidades 
export const getMySkills = async (req, res) => {
    try {
        const skills = await UserSkill.find({ userId: req.user._id }).populate('skillId', 'name');
        res.status(200).json({ success: true, data: skills });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// CLIENT: Ver Skills de un ID (del trabajador) 
export const getWorkerSkills = async (req, res) => {
    try {
        const { userId } = req.params;
        const skills = await UserSkill.find({ userId }).populate('skillId', 'name');
        res.status(200).json({ success: true, data: skills });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};