import Category from './category.model.js';

export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ status: 'ACTIVE' });

        res.status(200).json({
            success: true,
            data: categories
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener categorías',
            error: error.message
        });
    }
};

export const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findOne({ _id: id, status: 'ACTIVE' });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: category
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener categoría',
            error: error.message
        });
    }
};