'use strict';

import mongoose from 'mongoose';

const userSkillSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El usuario es obligatorio']
    },
    skillId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill',
        required: [true, 'La habilidad es obligatoria']
    },
    experienceYears: {
        type: Number,
        required: [true, 'Los años de experiencia son obligatorios'],
        min: [0, 'La experiencia no puede ser negativa']
    }
}, {
    timestamps: true,
    versionKey: false
});

export default mongoose.model('UserSkill', userSkillSchema);