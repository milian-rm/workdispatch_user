'use strict';
import mongoose from 'mongoose';
import UserSkill from './userSkill.model.js';

const emptySkillsResponse = (res) => res.status(200).json({ success: true, data: [] });

const getSkillsByUserId = (userId) => {
    return UserSkill.find({ userId }).populate({
        path: 'skillId',
        select: 'name categoryId',
        populate: {
            path: 'categoryId',
            select: 'name'
        }
    });
};

// WORKER: Agregar UserSkill 
export const addUserSkill = async (req, res) => {
    try {
        const data = req.body;
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
        const updated = await UserSkill.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        );
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Skill no encontrada'
            });
        }
        res.status(200).json({
            success: true,
            data: updated
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// WORKER: Ver sus propias habilidades 
export const getMySkills = async (req, res) => {
    try {
        const userId = req.params.userId || req.params.id;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return emptySkillsResponse(res);
        }

        const skills = await getSkillsByUserId(userId);
        res.status(200).json({ success: true, data: skills });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// CLIENT: Ver Skills de un ID (del trabajador) 
export const getWorkerSkills = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return emptySkillsResponse(res);
        }

        const skills = await getSkillsByUserId(userId);
        res.status(200).json({ success: true, data: skills });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
