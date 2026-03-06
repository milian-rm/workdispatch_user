'use strict';
import Skill from './skill.model.js';

// CLIENT y WORKER: Ver Skills 
export const getSkills = async (req, res) => {
    try {
        const skills = await Skill.find({ isActive: true }).populate('categoryId', 'name');
        res.status(200).json({ success: true, data: skills });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};